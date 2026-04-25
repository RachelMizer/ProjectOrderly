from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, blank=True, default="")

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    """
    Abstract product definition (e.g., Pizza, T-Shirt).
    Variants represent sellable SKUs under a Product.
    """

    supplier = models.ForeignKey(
        "suppliers.Supplier",
        on_delete=models.PROTECT,
        related_name="products",
        null=True,
        blank=True,
        help_text="Optional: vendor this product is sourced from",
    )
    category = models.ForeignKey(
        "catalog.Category",
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=200)

    # Added description field for better product details
    description = models.TextField(blank=True, help_text="Detailed product description")

    image = models.ImageField(upload_to="products/", null=True, blank=True)

    has_variants = models.BooleanField(
        default=True,
        help_text="If false, product should still have one default variant.",
    )
    has_modifiers = models.BooleanField(
        default=False,
        help_text="If true, variants can have modifier groups/options.",
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "name"],
                name="uniq_product_name_per_category",
            )
        ]

    def __str__(self) -> str:
        return self.name


class ProductVariant(models.Model):
    """
    Sellable unit / SKU (e.g., Large Pizza, T-Shirt Red L).
    Some variants are stock-tracked; others may be recipe-based (inventory app).
    """

    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.CASCADE,
        related_name="variants",
    )
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=64, unique=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Stock-tracked variants (nullable for non-stock variants, e.g., made-to-order items)
    stock_quantity = models.IntegerField(null=True, blank=True)
    reorder_level = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["product__name", "name"]
        indexes = [
            models.Index(fields=["product", "name"]),
            models.Index(fields=["sku"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "name"],
                name="uniq_variant_name_per_product",
            )
        ]

    def __str__(self) -> str:
        return f"{self.product.name} — {self.name}"


class ModifierGroup(models.Model):
    """
    Logical grouping of customization options for a specific variant (e.g., Toppings).
    """

    variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.CASCADE,
        related_name="modifier_groups",
    )
    name = models.CharField(max_length=150)

    required = models.BooleanField(default=False)
    min_selections = models.PositiveSmallIntegerField(default=0)
    max_selections = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ["variant__product__name", "variant__name", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["variant", "name"],
                name="uniq_modifier_group_name_per_variant",
            )
        ]

    def __str__(self) -> str:
        return f"{self.variant} — {self.name}"


class ModifierOption(models.Model):
    """
    Individual selectable option (e.g., Pepperoni +1.50).
    """

    group = models.ForeignKey(
        "catalog.ModifierGroup",
        on_delete=models.CASCADE,
        related_name="options",
    )
    name = models.CharField(max_length=150)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ["group__name", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["group", "name"],
                name="uniq_modifier_option_name_per_group",
            )
        ]

    def __str__(self) -> str:
        return f"{self.group.name}: {self.name}"