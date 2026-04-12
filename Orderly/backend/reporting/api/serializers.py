from rest_framework import serializers


class SalesSummaryBreakdownSerializer(serializers.Serializer):
    period = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    orders = serializers.IntegerField()


class SalesSummarySerializer(serializers.Serializer):
    startDate = serializers.DateField()
    endDate = serializers.DateField()
    groupBy = serializers.CharField()
    totalRevenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    totalOrders = serializers.IntegerField()
    averageOrderValue = serializers.DecimalField(max_digits=10, decimal_places=2)
    breakdown = SalesSummaryBreakdownSerializer(many=True)


class ProductSalesSerializer(serializers.Serializer):
    productId = serializers.IntegerField()
    productName = serializers.CharField()
    quantitySold = serializers.IntegerField()
    grossSales = serializers.DecimalField(max_digits=12, decimal_places=2)


class CategorySalesSerializer(serializers.Serializer):
    categoryId = serializers.IntegerField()
    categoryName = serializers.CharField()
    quantitySold = serializers.IntegerField()
    grossSales = serializers.DecimalField(max_digits=12, decimal_places=2)
