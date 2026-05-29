"""
Management command: seed_knowledge_base

Creates the initial set of knowledge base articles with backdated timestamps.
Safe to run multiple times — skips articles that already exist by title.

Usage:
    python manage.py seed_knowledge_base
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.timezone import make_aware
from datetime import datetime

from tickets.models import KnowledgeArticle

User = get_user_model()

ARTICLES = [
    {
        "title": "User Can't Log In After Being Inactive",
        "category": "Accounts",
        "date": datetime(2024, 9, 4),
        "body": (
            "If a support team member reports that their account suddenly stopped working and they have not logged in for an extended period, "
            "their account may have been automatically suspended due to inactivity.\n\n"
            "The system suspends support accounts that have not logged in for 90 or more days. A suspended account behaves like a deactivated "
            "account — the user is blocked from logging in but their data is preserved.\n\n"
            "To check and resolve this:\n"
            "1. Go to User Accounts Dashboard > Support Accounts\n"
            "2. Search for the user by name or email\n"
            "3. Open their account detail page\n"
            "4. Check the Account Status section — if the account shows Inactive, click Reactivate Account\n\n"
            "Once reactivated, the user should be able to log in immediately. Let them know they should log in regularly to avoid future suspension.\n\n"
            "Note: this also applies to any account type that has been manually deactivated. The same steps apply regardless of whether the deactivation was automatic or manual."
        ),
    },
    {
        "title": "Password Reset Link Expired or Not Working",
        "category": "Authentication",
        "date": datetime(2024, 9, 11),
        "body": (
            "Password reset links expire after one hour from the time they are generated. If a user reports that their reset link is not working, "
            "it has most likely expired before they used it.\n\n"
            "Common reasons this happens:\n"
            "- The user did not check their email promptly\n"
            "- The email was filtered to spam and found later\n"
            "- The user copied the link incorrectly or it was broken by their email client\n\n"
            "What to do:\n"
            "1. Ask the user to request a new password reset from the login page\n"
            "2. Tell them to check their spam or junk folder if the email does not arrive within a few minutes\n"
            "3. Tell them to use the link within one hour of receiving it\n"
            "4. If the email is not arriving at all, verify the email address on their account is correct (check in User Accounts Dashboard)\n\n"
            "If the user cannot access the login page or is otherwise locked out, you can manually reset their password from their account detail page. "
            "Go to User Accounts Dashboard, find the account, open the detail page, and use the Change Password section."
        ),
    },
    {
        "title": "Newly Created Employee Account Can't Access the Dashboard",
        "category": "Accounts",
        "date": datetime(2024, 9, 18),
        "body": (
            "When a new employee account is created through the User Accounts Dashboard, the account is created with the Employee role and staff "
            "access automatically. However, if an account was created through an older process or migrated from another source, it may be missing "
            "the staff flag required to access the admin dashboard.\n\n"
            "Things to check if an employee says they cannot log in or are redirected away from the dashboard:\n\n"
            "1. Verify the account exists — search for them in User Accounts Dashboard > Employee Accounts. If they do not appear there, their "
            "account may have been created as a customer account by mistake.\n\n"
            "2. Check the account is active — open their detail page and confirm the Account Status section shows Active. If it shows Inactive, "
            "click Reactivate Account.\n\n"
            "3. Confirm their role — on the account detail page, verify the role field shows Employee. If it shows Customer, the account was "
            "created under the wrong type. Create a new account with the correct role.\n\n"
            "4. Check their store assignment — employees need to be assigned to a location to access location-specific data. If the Store "
            "Assignment field is empty, assign them to their location and save.\n\n"
            "If none of these resolve the issue, the account may need to be deleted and recreated through the standard creation flow in User Accounts Dashboard."
        ),
    },
    {
        "title": "Product Shows as Unavailable But Should Be In Stock",
        "category": "Catalog",
        "date": datetime(2024, 9, 25),
        "body": (
            "When a customer or store manager reports that a product variant is showing as unavailable on the storefront or ordering system, "
            "there are two separate systems that control availability, and the cause depends on how that product is set up.\n\n"
            "System 1 — Inventory ingredient tracking:\n"
            "Some product variants are linked to inventory items (ingredients). When this is the case, the variant's availability is determined "
            "entirely by whether those linked inventory items have stock greater than zero. Even if the variant itself has a stock quantity set, "
            "it is ignored if ingredient links exist. Check with the store manager whether the relevant inventory items are running low or have "
            "been marked out of stock.\n\n"
            "System 2 — Simple stock quantity:\n"
            "If the variant is not linked to any inventory items, availability falls back to the stock_quantity field. A variant with a null "
            "stock quantity is treated as always available. A variant with a quantity of zero is treated as unavailable.\n\n"
            "To diagnose:\n"
            "- Ask the store manager to check the inventory levels for any ingredients linked to the affected variant\n"
            "- If no ingredient links exist, ask them to verify the variant's stock quantity in the catalog and update it if needed\n"
            "- If the product has just been restocked but still shows unavailable, the storefront may need a refresh — the availability status "
            "is calculated at request time, so a page reload should reflect current levels"
        ),
    },
    {
        "title": "Customer's Order Not Appearing in Their Order History",
        "category": "Orders",
        "date": datetime(2024, 10, 2),
        "body": (
            "If a customer reports that an order they placed is not showing up in their order history, work through the following checks before escalating.\n\n"
            "1. Confirm the order was actually placed — ask the customer if they received any confirmation at the time of ordering, or if the checkout "
            "appeared to complete. If the page errored out or they are unsure, the order may not have been submitted successfully.\n\n"
            "2. Check the order on the admin side — go to the relevant store's order management view and search for the customer's name or account. "
            "Orders are visible to store managers and above. If the order appears in the admin but not in the customer's history, this may be a "
            "display issue on the storefront.\n\n"
            "3. Check the account used — confirm the customer is logged into the correct account. It is possible they have more than one account "
            "(for example, one created through the storefront and one created manually). If the order was placed under a different account, it will "
            "not appear under their current login.\n\n"
            "4. Timing — orders are added to history as soon as they are placed. There is no processing delay. If the order is genuinely not in "
            "the system, it was not submitted successfully.\n\n"
            "If the order is missing and the customer needs to place it again, let them know they can reorder. If you need to verify whether an order "
            "was charged, that is outside the scope of the Orderly system — check with the relevant payment processor records."
        ),
    },
    {
        "title": "Customer Can't Complete Checkout",
        "category": "Storefront",
        "date": datetime(2024, 10, 9),
        "body": (
            "If a customer reports that they are unable to complete their order, use this checklist to identify the cause.\n\n"
            "Account issues:\n"
            "- Confirm the customer is logged in. Guest checkout is not supported — customers must have an account to place an order.\n"
            "- Confirm the account is active. An inactive account cannot place orders. Check in User Accounts Dashboard > Customer Accounts "
            "and reactivate if needed.\n\n"
            "Cart / product issues:\n"
            "- A product variant that was in the cart may have gone out of stock after it was added. The cart does not automatically update "
            "availability in real time. Ask the customer to remove the item and re-add it to see its current availability.\n"
            "- Required modifier groups must have a selection before checkout can proceed. If a product has a required modifier (for example, "
            "size or milk type) that was not selected, the order cannot be submitted. Ask the customer to review their cart items and make sure "
            "all required choices are filled in.\n\n"
            "If none of these apply and the customer is still blocked, ask them what error message or behavior they are seeing (blank page, "
            "spinning loader, specific error text) and note it in the ticket for further investigation."
        ),
    },
    {
        "title": "Product Images Appear Broken or Not Loading",
        "category": "Catalog",
        "date": datetime(2024, 10, 16),
        "body": (
            "If product images are displaying as broken icons on the storefront, this is almost always caused by an image path that does not "
            "match the expected format.\n\n"
            "Background:\n"
            "Product images that come with the seeded catalog data are stored as paths like img/bev/latte.png — these are served directly from "
            "the React frontend's public folder, which is always available. Images uploaded manually through the admin tools are stored differently "
            "and served through the backend.\n\n"
            "When an image shows as broken:\n"
            "1. The image file may not exist at the expected path. If the image was recently uploaded, confirm the upload completed successfully. "
            "If it was a seeded image, the path in the database may have been altered.\n"
            "2. The backend's FRONTEND_URL environment variable may be misconfigured. When a seeded image path starts with img/, the system "
            "constructs the URL using this variable. If it is set incorrectly or missing, the image URL will point to the wrong host. This is a "
            "backend configuration issue — flag it for the system administrator.\n"
            "3. The file was uploaded but the backend's media storage is ephemeral. On the current hosting setup, uploaded media files do not "
            "persist across deploys. Only images stored in the frontend's public folder (img/ paths) are permanent. Advise store managers to "
            "use catalog images from the approved image set when possible.\n\n"
            "If a specific product's image is broken while others load fine, the issue is likely isolated to that product's image record rather "
            "than a system-wide configuration problem."
        ),
    },
    {
        "title": "Store Logo or Favicon Not Showing on the Storefront",
        "category": "Settings",
        "date": datetime(2024, 10, 23),
        "body": (
            "If the store logo or browser favicon is missing or displaying as a broken image on the storefront, the cause and resolution are the "
            "same as for broken product images — the image path in the store settings is either incorrect or the file is not accessible.\n\n"
            "Things to check:\n\n"
            "1. Open the Store Settings and review the store image and favicon fields. If the fields are empty, no image has been set — the store "
            "manager or executive can upload one from the settings page.\n\n"
            "2. If images were previously set and are now missing, this is most likely due to the media storage limitation on the current hosting "
            "setup. Uploaded files do not persist across server deploys. Images that use a frontend path (img/store/logo.png style paths) are not "
            "affected by this.\n\n"
            "3. If the fields show a value but the image still does not display, the FRONTEND_URL environment variable on the backend may be "
            "misconfigured. This affects all images that rely on frontend path resolution. Flag this for the system administrator to verify the "
            "environment variable is set correctly.\n\n"
            "As a temporary workaround, the store manager can re-upload the image from the Store Settings page after each deploy if persistent "
            "media storage is not yet in place."
        ),
    },
    {
        "title": "Store Manager Can't See Their Location's Data",
        "category": "Accounts",
        "date": datetime(2024, 10, 30),
        "body": (
            "Store managers can only view and manage data for the location they are assigned to. If a store manager reports that their dashboard "
            "is empty, showing the wrong location's data, or that they cannot access location-specific features, the most likely cause is a missing "
            "or incorrect store assignment on their account.\n\n"
            "To check and fix:\n"
            "1. Go to User Accounts Dashboard > Store Manager Accounts\n"
            "2. Find and open the manager's account detail page\n"
            "3. Look at the Location field — this should show the store they are responsible for\n"
            "4. If it is blank or shows the wrong location, update it using the dropdown and click Save Changes\n\n"
            "Changes take effect on the manager's next page load. Let them know to refresh their dashboard after the update.\n\n"
            "If the location they should be assigned to does not appear in the dropdown, the location may not exist in the system yet or may have "
            "been deactivated. Check with an executive or system administrator to confirm the location is set up correctly.\n\n"
            "Also verify that the account's role is set to Store Manager and not Employee. Employees and store managers have different permission "
            "scopes — an employee assigned to a location will not have the same management access as a store manager."
        ),
    },
    {
        "title": "Low Stock Alerts Triggering Incorrectly",
        "category": "Inventory",
        "date": datetime(2024, 11, 6),
        "body": (
            "If a store manager reports that low stock alerts are firing for items that appear to have adequate stock, or are not firing for items "
            "that are genuinely low, the issue is usually related to how the alert threshold is configured for that item.\n\n"
            "How low stock alerts work:\n"
            "Each inventory item has a low stock threshold field. When the item's current stock quantity drops to or below that threshold, the item "
            "appears in the low stock alert list. The comparison is: stock_quantity <= low_stock_threshold.\n\n"
            "Alert firing when it should not:\n"
            "- The low stock threshold may be set too high relative to normal operating levels. For example, if a threshold is set to 50 and the "
            "store regularly operates with 30 units on hand, alerts will fire constantly. The store manager should adjust the threshold to a more "
            "appropriate level.\n"
            "- The stock quantity may have been entered incorrectly during a recent update. Ask the store manager to verify the current quantity is accurate.\n\n"
            "Alert not firing when it should:\n"
            "- The low stock threshold may be set to zero or left blank. A threshold of zero means an alert only fires when the item is completely "
            "out of stock. The store manager should set a threshold that gives them enough lead time to reorder.\n"
            "- The item may have been recently restocked in the system but not yet reflected — verify the most recent stock update timestamp.\n\n"
            "If alerts are appearing inconsistently across items and the thresholds all appear correct, this may indicate a display or caching issue. "
            "Ask the manager to reload the page and check again before escalating."
        ),
    },
    {
        "title": "Ticket Stuck in Unassigned — Can't Move to In Progress",
        "category": "Tickets",
        "date": datetime(2024, 11, 13),
        "body": (
            "A ticket cannot be moved to In Progress or In Review status unless it has an agent assigned to it. This is a system requirement, not "
            "a bug. If a drag-and-drop move on the Ticket Dashboard is blocked, or a status change on the ticket detail page fails, the missing "
            "assignee is almost always the reason.\n\n"
            "To resolve:\n"
            "1. Open the ticket detail page (click the ticket card on the board, or search by ticket ID in the sidebar)\n"
            "2. Find the Assignee field in the Update Ticket section\n"
            "3. Select an agent from the dropdown — this can be yourself or any other support team member\n"
            "4. Click Save Changes\n"
            "5. Return to the Ticket Dashboard and attempt the status change again\n\n"
            "If you are working a ticket solo and there is no other agent to assign it to, assign it to yourself. There is no rule preventing self-assignment.\n\n"
            "If the assignee dropdown is empty (no agents available to select), the issue may be that no support accounts are currently active in "
            "the system. Check User Accounts Dashboard > Support Accounts to confirm at least one active account exists.\n\n"
            "Note: closed tickets can be moved back to In Progress if a resolved issue resurfaces. The same assignee requirement applies — the "
            "ticket must have an assigned agent before it can be moved into an active status column."
        ),
    },
    {
        "title": "Reopening a Closed Ticket",
        "category": "Tickets",
        "date": datetime(2024, 11, 20),
        "body": (
            "Closed tickets are moved out of the active Ticket Dashboard and into the Ticket Archive, but they are not locked or deleted. If a "
            "resolved issue resurfaces and a closed ticket needs to be reopened, this can be done directly from the archive.\n\n"
            "Steps to reopen a closed ticket:\n"
            "1. Go to Ticket Archive from the sidebar\n"
            "2. Use the date filters if needed to narrow down when the ticket was originally opened\n"
            "3. Click the ticket row to open the full ticket detail page\n"
            "4. In the Update Ticket section, change the status from Closed to In Progress (or Unassigned if it needs to be reassigned)\n"
            "5. Verify the Assignee field is filled in — a ticket cannot be saved to In Progress status without an assigned agent\n"
            "6. Click Save Changes\n\n"
            "The ticket will immediately reappear on the active Ticket Dashboard in the appropriate column and will no longer show in the archive.\n\n"
            "Before reopening, consider whether the resurfaced issue is the same root cause as the original ticket or a new occurrence. If it is a "
            "new and distinct occurrence, it is usually better to open a fresh ticket so the history stays clean and the new case can be tracked "
            "independently. Use the Case Notes or Progress Log on the original ticket to link the two if they are related."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed the knowledge base with the initial set of articles."

    def handle(self, *args, **options):
        author = User.objects.filter(username="rmsupport").first()

        created_count = 0
        skipped_count = 0

        for article in ARTICLES:
            if KnowledgeArticle.objects.filter(title=article["title"]).exists():
                self.stdout.write(f"  Skipped (already exists): {article['title']}")
                skipped_count += 1
                continue

            obj = KnowledgeArticle.objects.create(
                title=article["title"],
                category=article["category"],
                body=article["body"],
                created_by=author,
            )

            # .update() bypasses auto_now_add and auto_now so we can backdate
            backdated = make_aware(article["date"])
            KnowledgeArticle.objects.filter(pk=obj.pk).update(
                created_at=backdated,
                updated_at=backdated,
            )

            self.stdout.write(f"  Created: {article['title']}")
            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} article(s) created, {skipped_count} skipped."
        ))
