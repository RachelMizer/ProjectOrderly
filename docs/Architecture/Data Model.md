# Data Model

## Entities

---
### Customer
Represents end users who place orders from the client business
##### Attributes:
+ CustomerID
+ FirstName
+ LastName
+ Email
+ StreetAddress
+ City
+ State
+ Zipcode
+ Phone
#### Table View
| CustomerID | FirstName | LastName | Email              | StreetAddress     | City     | State | Zipcode | Phone        |
|------------|-----------|----------|--------------------|-------------------|----------|-------|---------|--------------|
| 1          | Alex      | Johnson  | alex@example.com   | 123 Main St       | Raleigh  | NC    | 27601   | 555-123-4567 |

---


### Order
Represents a single customer transaction
##### Attributes:
+ OrderID
+ CustomerID
+ OrderDate
+ OrderSubtotal
+ TaxAmount
+ TotalPaymentDue
+ Status
#### Table View
| OrderID | CustomerID | OrderDate   | OrderSubtotal | TaxAmount | TotalPaymentDue | Status    |
|--------|------------|-------------|---------------|-----------|------------------|-----------|
| 1001   | 1          | 2026-02-08  | 12.50         | 1.00      | 13.50            | Completed |

---


### OrderItem
Represents a single purchased item within an order
##### Attributes:
+ OrderItemID
+ OrderID
+ VariantID
+ Quantity
+ UnitPriceCharged
+ ItemTotal
#### Table View
| OrderItemID | OrderID | VariantID | Quantity | UnitPriceCharged | ItemTotal |
|-------------|---------|-----------|----------|------------------|-----------|
| 5001        | 1001    | 2001      | 1        | 12.50            | 12.50     |
---

### OrderItemModifier
Captures which modifiers were selected for a specific order item
##### Attributes:
+ OrderItemModifierID
+ OrderItemID
+ ModifierOptionID
+ PriceAdjustmentCharged
#### Table View
| OrderItemModifierID | OrderItemID | ModifierOptionID | PriceAdjustmentCharged |
|---------------------|-------------|------------------|------------------------|
| 7001                | 5001        | 3001             | 1.50                   |
---


### Category
Organizes products for browsing, filtering, reporting
##### Attributes:
+ CategoryID
+ CategoryName
#### Table View
| CategoryID | CategoryName |
|------------|--------------|
| 10         | Food         |
---

### Product
Represents an abstract item or service offered by the client business
##### Attributes:
+ ProductID
+ SupplierID
+ ProductName
+ CategoryID
+ HasVariants - Indicates whether multiple SKUs exist under this product. Even if 'No', the product will have one default product variant
+ HasModifiers - indicates if customization is available
#### Table View
| ProductID | SupplierID | ProductName | CategoryID | HasVariants | HasModifiers |
|-----------|------------|-------------|------------|-------------|--------------|
| 100       | 900         | Pizza       | 10         | Yes         | Yes          |
---

### ProductVariant
Used for products that are sold as discrete units. individual SKUs
##### Attributes:
+ VariantID
+ ProductID
+ VariantName
+ SKU
+ UnitPrice
+ StockQuantity
+ ReorderLevel
#### Table View
| VariantID | ProductID | VariantName        | SKU          | UnitPrice | StockQuantity | ReorderLevel |
|-----------|-----------|--------------------|--------------|-----------|---------------|--------------|
| 2001      | 100       | Large Pizza        | PIZ-LRG-01   | 12.50     | NULL          | NULL         |
| 2002      | 101       | T-Shirt (Red, L)   | TSH-RED-L    | 19.99     | 15            | 5            |
---

### VariantInventoryUsage
Used for product variants that behave like recipes, not stockable units. links InventoryItems (ingredients) to ProductVariants (recipes)
##### Attributes:
+ VariantInventoryUsageID
+ VariantID
+ InventoryItemID
+ QuantityUsed
+ #### TableView
| VariantInventoryUsageID | VariantID | InventoryItemID | QuantityUsed |
|-------------------------|-----------|------------------|--------------|
| 9001                    | 2001      | 8001             | 1            |
| 9002                    | 2001      | 8002             | 6            |
| 9003                    | 2001      | 8003             | 4            |
---

### ModifierGroup
Defines logical group of customization options for a product. Associated with product variants to allow variant-specific pricing and inventory control. Products without variants already default to a single variant. 
##### Attributes:
+ ModifierGroupID
+ VariantID
+ GroupName
+ Required
+ MinSelections
+ MaxSelections
#### Table View
| ModifierGroupID | VariantID | GroupName | Required | MinSelections | MaxSelections |
|-----------------|-----------|-----------|----------|---------------|---------------|
| 4001            | 2001      | Toppings  | No       | 0             | 5             |
---


### ModifierOption
Defines an individual selectable customization
##### Attributes:
+ ModifierOptionID
+ ModifierGroupID
+ OptionName
+ PriceAdjustment
#### Table View
| ModifierOptionID | ModifierGroupID | OptionName  | PriceAdjustment |
|------------------|-----------------|-------------|-----------------|
| 3001             | 4001            | Pepperoni  | 1.50            |
---

### ModifierInventoryUsage
Defines how modifiers affect inventory
##### Attributes:
+ ModifierInventoryUsageID
+ ModifierOptionID
+ InventoryItemID
+ QuantityUsed
#### Table View
| ModifierInventoryUsageID | ModifierOptionID | InventoryItemID | QuantityUsed |
|--------------------------|------------------|------------------|--------------|
| 6001                     | 3001             | 8001             | 5.0          |
---

### InventoryItem
Used for components shared across products or modifiers. Not sold as unique, discrete products.
##### Attributes:
+ InventoryItemID
+ Name
+ StockQuantity
+ UnitOfMeasure
+ ReorderLevel
#### Table View
| InventoryItemID | Name       | StockQuantity | UnitOfMeasure | ReorderLevel |
|-----------------|------------|---------------|---------------|--------------|
| 8001            | Pizza Dough| 40            | units         | 10           |
| 8002            | Cheese     | 120           | oz            | 30           |
| 8003            | Tomato Sauce | 90          | oz            | 25           |
---


### Payment
Records payment attempts or transactions associated with an order
##### Attributes:
+ PaymentID
+ OrderID
+ PaymentType
+ Total
+ PaymentDate
#### Table View
| PaymentID | OrderID | PaymentType | Total | PaymentDate |
|-----------|---------|-------------|-------|-------------|
| 9001      | 1001    | CreditCard  | 13.50 | 2026-02-08  |
---


### Supplier
Represents external vendors that provide inventory units to the business client
##### Attributes:
+ SupplierID
+ SupplierName
+ SupplierAddress
+ SupplierCity
+ SupplierState
+ SupplierZipCode
+ SupplierPhone
+ SupplierContact
+ SupplierEmail
#### Table View
| SupplierID | SupplierName      | SupplierAddress | SupplierCity | SupplierState | SupplierZipCode | SupplierPhone | SupplierContact | SupplierEmail          |
|------------|-------------------|-----------------|--------------|---------------|------------------|---------------|-----------------|------------------------|
| 900        | Acme Foods Supply | 45 Warehouse Rd | Durham       | NC            | 27701            | 555-987-6543  | Jamie Smith     | jamie@acmefoods.com    |
---


### SupplierOrders
Represents a restocking transaction with a supplier
##### Attributes:
+ SupplierOrderID
+ SupplierID
+ SupplierOrderDate
+ SupplierOrderTotal
+ Status
#### Table View
| SupplierOrderID | SupplierID | SupplierOrderDate | SupplierOrderTotal | Status    |
|-----------------|------------|-------------------|--------------------|-----------|
| 30001           | 900        | 2026-02-05        | 250.00             | Received  |
---


### SupplierOrderVariantItem
Represents a purchased product variant in a given supplier order
##### Attributes:
+ SupplierOrderVariantItemID
+ SupplierOrderID
+ VariantID
+ Quantity
+ UnitPricePaid
+ ItemTotal
#### Table View
| SupplierOrderVariantItemID | SupplierOrderID | VariantID | Quantity | UnitPricePaid | ItemTotal |
|----------------------------|-----------------|-----------|----------|---------------|-----------|
| 31001                      | 30001           | 2001      | 10       | 9.00          | 90.00     |
---

### SupplierOrderInventoryItem
Represents a purchased inventory item in a given supplier order
##### Attributes:
+ SupplierOrderInventoryItemID
+ SupplierOrderID
+ InventoryItemID
+ Quantity
+ UnitPricePaid
+ ItemTotal
#### Table View
| SupplierOrderInventoryItemID | SupplierOrderID | InventoryItemID | Quantity | UnitPricePaid | ItemTotal |
|-------------------------------|-----------------|------------------|----------|---------------|-----------|
| 32001                         | 30001           | 8001             | 20       | 4.00          | 80.00     |
---


### SupplierPayments
Tracks payments made to suppliers for supplier orders
##### Attributes:
+ SupplierPaymentID
+ SupplierOrderID
+ SupplierPaymentType
+ PaymentDate
+ TotalPayment
+ SupplierPaymentStatus
#### Table View
| SupplierPaymentID | SupplierOrderID | SupplierPaymentType | PaymentDate | TotalPayment | SupplierPaymentStatus |
|-------------------|-----------------|----------------------|-------------|--------------|------------------------|
| 33001             | 30001           | BankTransfer         | 2026-02-06  | 250.00       | Paid                   |
---
