*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${ADMIN_REPORTS_URL}      ${BASE_URL}/admin/reports
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${ADMIN_CATALOG_URL}      ${BASE_URL}/admin/catalog
${ADMIN_ORDERS_URL}       ${BASE_URL}/admin/orders
${ADMIN_DASHBOARD_URL}    ${BASE_URL}/admin

*** Test Cases ***
Reports Route Keeps Admin Shell And Shows Current Reports Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_REPORTS_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Generate a Report    15s
    Wait Until Page Contains    View sales performance, product trends, and business metrics    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Wait Until Page Contains    Revenue by Month    15s
    Wait Until Page Contains    Sales Summary    15s
    Wait Until Page Contains    Product Performance    15s
    Capture Page Screenshot
    Close Browser

Inventory Route Keeps Admin Shell And Shows Current Inventory Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Track and update stock levels for all inventory items    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Wait Until Page Contains    Ingredient-Controlled Beverage Availability    15s
    Wait Until Page Contains    Count-Based Inventory    15s
    Capture Page Screenshot
    Close Browser

Catalog Route Keeps Admin Shell And Shows Current Catalog Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Browse and manage the full product catalog    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search products...']    15s
    Wait Until Page Contains    CREATE NEW PRODUCT    15s
    Wait Until Page Contains    ADD SUPPLIER    15s
    Capture Page Screenshot
    Close Browser

Orders Route Keeps Admin Shell And Shows Inactive Deferred Links
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_ORDERS_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Orders    15s
    Wait Until Page Contains    Recent Orders    15s
    Wait Until Page Contains    Open Order    15s
    Wait Until Page Contains    Search History    15s
    Wait Until Page Contains    Returns & Refunds    15s
    Wait Until Page Contains    Shipping    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Capture Page Screenshot
    Close Browser

Dashboard Nav Cards Route To All Admin Sections
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_DASHBOARD_URL}

    Wait Until Page Contains    Dashboard Home    10s

    Click Link    Reports
    Wait Until Page Contains    Generate a Report    10s
    Wait Until Page Contains    Revenue by Month    10s

    Go To    ${ADMIN_DASHBOARD_URL}
    Click Link    Inventory
    Wait Until Page Contains    Ingredient-Controlled Beverage Availability    10s

    Go To    ${ADMIN_DASHBOARD_URL}
    Click Link    Product Catalog
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search products...']    10s

    Go To    ${ADMIN_DASHBOARD_URL}
    Click Link    Orders
    Wait Until Page Contains    Recent Orders    10s

    Capture Page Screenshot
    Close Browser