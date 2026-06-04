from rest_framework import serializers
from payroll.models import PayPeriod


class PayPeriodSerializer(serializers.ModelSerializer):
    startDate = serializers.DateField(source="start_date")
    endDate = serializers.DateField(source="end_date")
    createdBy = serializers.SerializerMethodField()

    class Meta:
        model = PayPeriod
        fields = ["id", "name", "startDate", "endDate", "createdBy", "created_at"]
        read_only_fields = ["id", "createdBy", "created_at"]

    def get_createdBy(self, obj):
        if obj.created_by:
            u = obj.created_by
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return None

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and end <= start:
            raise serializers.ValidationError({"endDate": "End date must be after start date."})
        return attrs
