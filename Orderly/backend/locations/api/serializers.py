from rest_framework import serializers
from locations.models import Location, Region, StateProvince


class StateProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateProvince
        fields = ["id", "name", "abbreviation", "region", "created_at"]
        read_only_fields = ["id", "created_at"]


class RegionSerializer(serializers.ModelSerializer):
    location_count = serializers.SerializerMethodField()
    states = StateProvinceSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ["id", "name", "country", "location_count", "states", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_location_count(self, obj):
        return obj.locations.count()


class LocationSerializer(serializers.ModelSerializer):
    region_name         = serializers.CharField(source="region.name",                  read_only=True, default=None)
    region_country      = serializers.CharField(source="region.country",               read_only=True, default=None)
    state_province_name = serializers.CharField(source="state_province.name",          read_only=True, default=None)
    state_province_abbr = serializers.CharField(source="state_province.abbreviation",  read_only=True, default=None)
    staff               = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "location_number",
            "name",
            "region",
            "region_name",
            "region_country",
            "state_province",
            "state_province_name",
            "state_province_abbr",
            "manager_name",
            "address",
            "city",
            "state",
            "zip_code",
            "phone",
            "email",
            "is_active",
            "staff",
            "created_at",
        ]
        read_only_fields = ["id", "staff", "created_at"]

    def get_staff(self, obj):
        return [
            {
                "id": ur.user.pk,
                "name": f"{ur.user.first_name} {ur.user.last_name}".strip() or ur.user.username,
                "role": ur.role,
            }
            for ur in obj.staff.select_related("user").all()
        ]
