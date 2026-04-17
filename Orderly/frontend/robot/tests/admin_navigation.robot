*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${ADMIN_REPORTS_URL}      ${BASE_URL}/admin/reports
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${ADMIN_CATALOG_URL}      ${BASE_URL}/admin/catalog
${ADMIN_ORDERS_URL}       ${BASE_URL}/admin/orders

*** Test Cases ***
Reports Route Keeps Admin Shell And Shows Current Reports Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_REPORTS_URL}

    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Generate a Report    10s
    Wait Until Page Contains    View sales performance, product trends, and business metrics    10s
    Wait Until Page Contains    Return to Dashboard    10s
    Wait Until Page Contains    Revenue by Month    10s
    Wait Until Page Contains    Sales Summary    10s
    Wait Until Page Contains    Product Performance    10s
    Wait Until Page Contains    Account Settings    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Inventory Route Keeps Admin Shell And Shows Current Inventory Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Track and update stock levels for all inventory items    10s
    Wait Until Page Contains    Return to Dashboard    10s
    Wait Until Page Contains    Inventory Management    10s
    Wait Until Page Contains    Ingredient-Controlled Beverage Availability    10s
    Wait Until Page Contains    Count-Based Inventory    10s
    Wait Until Page Contains    Account Settings    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Catalog Route Keeps Admin Shell And Shows Current Catalog Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Browse and manage the full product catalog    10s
    Wait Until Page Contains    Return to Dashboard    10s
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search products...']    10s
    Wait Until Page Contains    CREATE NEW PRODUCT    10s
    Wait Until Page Contains    ADD SUPPLIER    10s
    Wait Until Page Contains    Account Settings    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Orders Route Keeps Admin Shell And Shows Deferred Links
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_ORDERS_URL}

    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Orders    10s
    Wait Until Page Contains    Recent Orders    10s
    Wait Until Page Contains    Open Order    10s
    Wait Until Page Contains    Search History    10s
    Wait Until Page Contains    Returns & Refunds    10s
    Wait Until Page Contains    Shipping    10s
    Wait Until Page Contains    Return to Dashboard    10s
    Capture Page Screenshot
    Close Browser