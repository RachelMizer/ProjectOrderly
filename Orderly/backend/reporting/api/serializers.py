from rest_framework import serializers


# ----------------------
# INPUT SERIALIZERS
# ----------------------


class DateRangeSerializer(serializers.Serializer):
    startDate = serializers.DateField()
    endDate = serializers.DateField()

    def validate(self, data):
        if data["endDate"] < data["startDate"]:
            raise serializers.ValidationError(
                "endDate must be greater than or equal to startDate"
            )
        return data


class SalesSummaryQuerySerializer(DateRangeSerializer):
    groupBy = serializers.ChoiceField(
        choices=["day", "week", "month"], required=False, default="day"
    )


class ProductSalesQuerySerializer(DateRangeSerializer):
    limit = serializers.IntegerField(
        required=False, default=10, min_value=1, max_value=100
    )


# ----------------------
# OUTPUT SERIALIZERS
# ----------------------


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


class ProductSalesListSerializer(serializers.Serializer):
    startDate = serializers.DateField()
    endDate = serializers.DateField()
    limit = serializers.IntegerField()
    results = ProductSalesSerializer(many=True)


class CategorySalesSerializer(serializers.Serializer):
    categoryId = serializers.IntegerField()
    categoryName = serializers.CharField()
    quantitySold = serializers.IntegerField()
    grossSales = serializers.DecimalField(max_digits=12, decimal_places=2)


class CategorySalesListSerializer(serializers.Serializer):
    startDate = serializers.DateField()
    endDate = serializers.DateField()
    results = CategorySalesSerializer(many=True)
