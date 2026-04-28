import pytest
from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


# =========================
# FIXTURES
# =========================

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="business@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.fixture
def admin_client(api_client, business_user):
    api_client.force_authenticate(user=business_user)
    return api_client


@pytest.fixture
def customer_client(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)
    return api_client


@pytest.fixture
def setup_sales_data(db):
    """
    Creates deterministic reporting data.

    Both COMPLETED and PENDING orders are counted as revenue:
    - Pizza: qty 3, gross 30.00, order total 33.00  (COMPLETED)
    - Burger: qty 2, gross 10.00, order total 11.00  (COMPLETED)
    - Soda: qty 2, gross 6.00, order total 6.60  (PENDING — still counted)

    Total revenue: 50.60 | Total orders: 3
    """
    category = Category.objects.create(name="Food")
    other_category = Category.objects.create(name="Drinks")

    pizza = Product.objects.create(name="Pizza", category=category)
    burger = Product.objects.create(name="Burger", category=category)
    soda = Product.objects.create(name="Soda", category=other_category)

    pizza_variant = ProductVariant.objects.create(
        product=pizza,
        name="Regular",
        sku="PIZZA-REG",
        unit_price=Decimal("10.00"),
    )
    burger_variant = ProductVariant.objects.create(
        product=burger,
        name="Regular",
        sku="BURGER-REG",
        unit_price=Decimal("5.00"),
    )
    soda_variant = ProductVariant.objects.create(
        product=soda,
        name="Bottle",
        sku="SODA-BTL",
        unit_price=Decimal("3.00"),
    )

    target_dt = timezone.now() - timedelta(days=1)
    target_date = target_dt.date()

    # COMPLETED ORDER 1 -> total_payment_due = 33.00
    order1 = Order.objects.create(
        guest_email="guest1@test.com",
        subtotal=Decimal("30.00"),
        tax_amount=Decimal("3.00"),
        status=OrderStatus.COMPLETED,
    )
    Order.objects.filter(pk=order1.pk).update(order_date=target_dt)
    order1.refresh_from_db()

    OrderItem.objects.create(
        order=order1,
        variant=pizza_variant,
        quantity=3,
        unit_price_charged=Decimal("10.00"),
    )

    # COMPLETED ORDER 2 -> total_payment_due = 11.00
    order2 = Order.objects.create(
        guest_email="guest2@test.com",
        subtotal=Decimal("10.00"),
        tax_amount=Decimal("1.00"),
        status=OrderStatus.COMPLETED,
    )
    Order.objects.filter(pk=order2.pk).update(order_date=target_dt)
    order2.refresh_from_db()

    OrderItem.objects.create(
        order=order2,
        variant=burger_variant,
        quantity=2,
        unit_price_charged=Decimal("5.00"),
    )

    # EXCLUDED ORDER -> PENDING
    excluded_order = Order.objects.create(
        guest_email="guest3@test.com",
        subtotal=Decimal("6.00"),
        tax_amount=Decimal("0.60"),
        status=OrderStatus.PENDING,
    )
    Order.objects.filter(pk=excluded_order.pk).update(order_date=target_dt)
    excluded_order.refresh_from_db()

    OrderItem.objects.create(
        order=excluded_order,
        variant=soda_variant,
        quantity=2,
        unit_price_charged=Decimal("3.00"),
    )

    return {
        "target_date": target_date,
        "category": category,
        "other_category": other_category,
        "pizza": pizza,
        "burger": burger,
        "soda": soda,
    }


# =========================
# SALES SUMMARY TESTS
# =========================

@pytest.mark.django_db
def test_sales_summary_success(admin_client, setup_sales_data):
    target_date = setup_sales_data["target_date"]

    response = admin_client.get(
        f"/api/v1/reports/sales/summary?startDate={target_date}&endDate={target_date}"
    )

    assert response.status_code == 200

    data = response.data

    # All three orders (COMPLETED + PENDING): 33.00 + 11.00 + 6.60 = 50.60
    assert float(data["totalRevenue"]) == 50.60
    assert data["totalOrders"] == 3
    assert float(data["averageOrderValue"]) == 16.87

    assert data["groupBy"] == "day"
    assert len(data["breakdown"]) == 1
    assert data["breakdown"][0]["period"] == str(target_date)
    assert float(data["breakdown"][0]["revenue"]) == 50.60
    assert data["breakdown"][0]["orders"] == 3


@pytest.mark.django_db
def test_sales_summary_no_data(admin_client):
    response = admin_client.get(
        "/api/v1/reports/sales/summary?startDate=2020-01-01&endDate=2020-01-02"
    )

    assert response.status_code == 200

    data = response.data
    assert float(data["totalRevenue"]) == 0.00
    assert data["totalOrders"] == 0
    assert float(data["averageOrderValue"]) == 0.00
    assert data["breakdown"] == []


# =========================
# BEST SELLERS TESTS
# =========================

@pytest.mark.django_db
def test_best_sellers_ranking(admin_client, setup_sales_data):
    target_date = setup_sales_data["target_date"]
    pizza = setup_sales_data["pizza"]
    burger = setup_sales_data["burger"]
    soda = setup_sales_data["soda"]

    response = admin_client.get(
        f"/api/v1/reports/sales/best-sellers?startDate={target_date}&endDate={target_date}"
    )

    assert response.status_code == 200

    results = response.data["results"]
    assert len(results) == 3

    # Pizza sold 3, Burger sold 2, Soda sold 2 (PENDING orders counted)
    assert results[0]["productId"] == pizza.id
    assert results[0]["productName"] == "Pizza"
    assert results[0]["quantitySold"] == 3
    assert float(results[0]["grossSales"]) == 30.00

    assert results[1]["productId"] == burger.id
    assert results[1]["productName"] == "Burger"
    assert results[1]["quantitySold"] == 2
    assert float(results[1]["grossSales"]) == 10.00

    assert results[2]["productId"] == soda.id
    assert results[2]["productName"] == "Soda"
    assert results[2]["quantitySold"] == 2
    assert float(results[2]["grossSales"]) == 6.00


@pytest.mark.django_db
def test_best_sellers_limit(admin_client, setup_sales_data):
    target_date = setup_sales_data["target_date"]
    pizza = setup_sales_data["pizza"]

    response = admin_client.get(
        f"/api/v1/reports/sales/best-sellers?startDate={target_date}&endDate={target_date}&limit=1"
    )

    assert response.status_code == 200
    assert response.data["limit"] == 1
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["productId"] == pizza.id


# =========================
# SALES BY CATEGORY TESTS
# =========================

@pytest.mark.django_db
def test_sales_by_category_success(admin_client, setup_sales_data):
    target_date = setup_sales_data["target_date"]
    category = setup_sales_data["category"]
    other_category = setup_sales_data["other_category"]

    response = admin_client.get(
        f"/api/v1/reports/sales/by-category?startDate={target_date}&endDate={target_date}"
    )

    assert response.status_code == 200

    results = response.data["results"]
    assert len(results) == 2

    # Food: pizza (3) + burger (2), Drinks: soda (2) from PENDING order (counted)
    assert results[0]["categoryId"] == category.id
    assert results[0]["categoryName"] == category.name
    assert results[0]["quantitySold"] == 5
    assert float(results[0]["grossSales"]) == 40.00

    assert results[1]["categoryId"] == other_category.id
    assert results[1]["categoryName"] == other_category.name
    assert results[1]["quantitySold"] == 2
    assert float(results[1]["grossSales"]) == 6.00


# =========================
# DATA INTEGRITY TESTS
# =========================

@pytest.mark.django_db
def test_sales_data_matches_db(admin_client, setup_sales_data):
    target_date = setup_sales_data["target_date"]

    response = admin_client.get(
        f"/api/v1/reports/sales/summary?startDate={target_date}&endDate={target_date}"
    )

    assert response.status_code == 200

    total_db = (
        Order.objects.filter(
            status__in=[OrderStatus.COMPLETED, OrderStatus.PENDING],
            order_date__date__range=[target_date, target_date],
        ).aggregate(total=Sum("total_payment_due"))["total"]
        or Decimal("0.00")
    )

    assert float(response.data["totalRevenue"]) == float(total_db)


# =========================
# RBAC TESTS
# =========================

@pytest.mark.django_db
def test_customer_cannot_access_reports(customer_client):
    response = customer_client.get(
        "/api/v1/reports/sales/summary?startDate=2026-01-01&endDate=2026-01-02"
    )

    assert response.status_code == 403
    assert response.data["error"] == "INVALID_ROLE"
    assert response.data["message"] == "User does not have this permission."


@pytest.mark.django_db
def test_unauthenticated_blocked(api_client):
    response = api_client.get(
        "/api/v1/reports/sales/summary?startDate=2026-01-01&endDate=2026-01-02"
    )

    assert response.status_code == 401


# =========================
# VALIDATION TESTS
# =========================

@pytest.mark.django_db
def test_invalid_date_range(admin_client):
    response = admin_client.get(
        "/api/v1/reports/sales/summary?startDate=2026-02-01&endDate=2026-01-01"
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_missing_dates(admin_client):
    response = admin_client.get("/api/v1/reports/sales/summary")
    assert response.status_code == 400


@pytest.mark.django_db
def test_invalid_best_sellers_limit(admin_client):
    response = admin_client.get(
        "/api/v1/reports/sales/best-sellers?startDate=2026-01-01&endDate=2026-01-02&limit=101"
    )
    assert response.status_code == 400