# Data Model

## Entities

---
### Customer
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
---


### Order
##### Attributes:
+ OrderID
+ ~~OrderItemID~~
+ CustomerID
+ ~~PaymentID~~
+ OrderDate
+ OrderSubtotal
+ TaxAmount
+ TotalPaymentDue
+ Status
#### Table View
---


### OrderItem
##### Attributes:
+ OrderItemID
+ OrderID
+ VariantID
+ Quantity
+ UnitPriceCharged
+ ItemTotal
#### Table View
---


### Category
##### Attributes:
+ CategoryID
+ CategoryName
#### Table View
---

### Product
##### Attributes:
+ ProductID
+ SupplierID
+ ProductName
+ CategoryID
+ HasVariants
+ HasModifiers
#### Table View
---

### ProductVariant
##### Attributes:
+ VariantID
+ ProductID
+ VariantName
+ SKU
+ UnitPrice
+ StockQuantity
#### Table View
---

### ModifierGroup
##### Attributes:
+ ModifierGroupID
+ ProductID
+ GroupName
+ Required
+ MinSelections
+ MaxSelections
#### Table View
---

### ModifierOption
##### Attributes:
+ ModifierOptionID
+ ModifierGroupId
+ OptionName
+ PriceAdjustment
#### Table View
---

### ModifierInventoryUsage
##### Attributes:
+ ModifierInventoryUsageID
+ ModifierOptionID
+ InventoryItemID
+ QuantityUsed
#### Table View
---

### InventoryItem
##### Attributes:
+ InventoryItemID
+ Name
+ CurrentStock
+ UnitOfMeasure
+ ReorderLevel
#### Table View
---


### Payment
##### Attributes:
+ PaymentID
+ OrderID
+ PaymentType
+ Total
+ PaymentDate
#### Table View
---


### Supplier
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
---


### SupplierOrders
##### Attributes:
+ SupplierOrderID
+ SupplierID
+ ~~SupplierOrderItem~~
+ ~~SupplierPaymentID~~
+ SupplierOrderDate
+ SupplierOrderTotal
+ Status
#### Table View
---


### SupplierOrderItem
##### Attributes:
+ SupplierOrderItemID
+ SupplierOrderID
+ ~~SupplierID~~
+ ProductID
+ Quantity
+ UnitPricePaid
+ ItemTotal
#### Table View
---


### SupplierPayments
##### Attributes:
+ SupplierPaymentID
+ SupplierOrderID
+ ~~SupplierID~~
+ SupplierPaymentType
+ PaymentDate
+ TotalPayment
+ SupplierPaymentStatus
#### Table View
---
