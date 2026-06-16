CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_business_type public.business_type;
BEGIN
  -- Safely parse role, fallback to customer if error
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    IF v_role IS NULL THEN
      v_role := 'customer'::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'customer'::public.user_role;
  END;

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    v_role
  );

  -- Safely insert vendor profile if role is vendor
  IF v_role = 'vendor'::public.user_role THEN
    -- Parse business type safely
    BEGIN
      v_business_type := (NEW.raw_user_meta_data->>'business_type')::public.business_type;
      IF v_business_type IS NULL THEN
        v_business_type := 'farmer'::public.business_type;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_business_type := 'farmer'::public.business_type;
    END;

    INSERT INTO public.vendor_profiles (user_id, business_name, business_type)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name', 'My Business'),
      v_business_type
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
