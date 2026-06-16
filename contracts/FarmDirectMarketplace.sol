// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FarmDirectMarketplace {
    uint256 public productCount = 0;
    uint256 public orderCount = 0;

    struct Product {
        uint256 id;
        address payable seller;
        uint256 price; // in wei
        bool isActive;
        string originMetadataCID; // IPFS CID for extra metadata, though Supabase will hold most of it
    }

    struct Order {
        uint256 id;
        uint256 productId;
        address buyer;
        address seller;
        uint256 amount;
        bool isDelivered;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;

    event ProductListed(
        uint256 indexed id,
        address indexed seller,
        uint256 price,
        string originMetadataCID
    );

    event ProductPurchased(
        uint256 indexed orderId,
        uint256 indexed productId,
        address indexed buyer,
        address seller,
        uint256 amount
    );

    event OrderDelivered(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller
    );

    function listProduct(uint256 _price, string memory _originMetadataCID) external returns (uint256) {
        require(_price > 0, "Price must be greater than zero");

        productCount++;
        products[productCount] = Product(
            productCount,
            payable(msg.sender),
            _price,
            true,
            _originMetadataCID
        );

        emit ProductListed(productCount, msg.sender, _price, _originMetadataCID);
        
        return productCount;
    }

    function buyProduct(uint256 _productId) external payable returns (uint256) {
        Product memory _product = products[_productId];
        
        require(_product.id > 0, "Product does not exist");
        require(_product.isActive, "Product is not active");
        require(msg.value >= _product.price, "Insufficient funds sent");
        require(msg.sender != _product.seller, "Seller cannot buy own product");

        // Transfer funds directly to the seller
        // In a real escrow, we would hold this until delivery. 
        // For simplicity, we transfer immediately here.
        (bool success, ) = _product.seller.call{value: msg.value}("");
        require(success, "Transfer to seller failed");

        orderCount++;
        orders[orderCount] = Order(
            orderCount,
            _productId,
            msg.sender,
            _product.seller,
            msg.value,
            false
        );

        emit ProductPurchased(orderCount, _productId, msg.sender, _product.seller, msg.value);

        return orderCount;
    }

    // Optional function to update delivery status
    function confirmDelivery(uint256 _orderId) external {
        Order storage _order = orders[_orderId];
        require(_order.id > 0, "Order does not exist");
        require(msg.sender == _order.buyer || msg.sender == _order.seller, "Only buyer or seller can confirm");
        
        _order.isDelivered = true;

        emit OrderDelivered(_orderId, _order.buyer, _order.seller);
    }
}
