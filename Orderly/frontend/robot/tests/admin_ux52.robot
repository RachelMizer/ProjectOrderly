*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Suite Setup       Open Browser To Admin Login
Suite Teardown    Close Browser
Test Setup        Go To Admin Login

*** Variables ***
${ADMIN_LOGIN_URL}          ${BASE_URL}/admin/login
${ADMIN_CATALOG_URL}        ${BASE_URL}/admin/catalog
${ADMIN_CREATE_URL}         ${BASE_URL}/admin/catalog/new
${ADMIN_SUPPLIER_URL}       ${BASE_URL}/admin/suppliers/new

${BROWSER_WIDTH}            1440
${BROWSER_HEIGHT}           1000

${NEW_PRODUCT_NAME}         UI Test Product
${UPDATED_PRODUCT_NAME}     UI Test Product Updated
${NEW_SUPPLIER_NAME}        UI Test Supplier
${NEW_SUPPLIER_EMAIL}       uitestsupplier@example.com
${NEW_SUPPLIER_PHONE}       9195557777

${NEW_VARIANT_NAME}         Medium
${NEW_VARIANT_SKU}          UITEST-MD
${UPDATED_VARIANT_NAME}     Medium Updated

*** Test Cases ***
Business Admin Can Open Product Catalog
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Search products..."]    10s
    Wait Until Page Contains Element    xpath=//button[contains(., "+ CREATE NEW PRODUCT")]    10s
    Wait Until Page Contains Element    xpath=//button[contains(., "+ ADD SUPPLIER")]    10s
    Capture Page Screenshot

Business Admin Can Open Create Product Form
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Page Contains Element    xpath=//button[contains(., "+ CREATE NEW PRODUCT")]    10s
    Click Button    xpath=//button[contains(., "+ CREATE NEW PRODUCT")]
    Wait Until Page Contains    Create A New Product    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Product name"]    10s
    Wait Until Page Contains Element    xpath=//select[@name="category"]    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="SKU"]    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="0.00"]    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Leave blank if not tracked"]    10s
    Capture Page Screenshot

Business Admin Can Open Add Supplier Form
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Page Contains Element    xpath=//button[contains(., "+ ADD SUPPLIER")]    10s
    Click Button    xpath=//button[contains(., "+ ADD SUPPLIER")]
    Wait Until Page Contains    Add New Supplier    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Supplier name"]    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="contact@supplier.com"]    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Phone number"]    10s
    Capture Page Screenshot

Business Admin Can Create Supplier From Catalog Flow
    Login As Business Admin
    Go To    ${ADMIN_SUPPLIER_URL}
    Wait Until Page Contains    Add New Supplier    10s
    Input Text    xpath=//input[@placeholder="Supplier name"]    ${NEW_SUPPLIER_NAME}
    Input Text    xpath=//input[@placeholder="contact@supplier.com"]    ${NEW_SUPPLIER_EMAIL}
    Input Text    xpath=//input[@placeholder="Phone number"]    ${NEW_SUPPLIER_PHONE}
    Click Button    xpath=//button[contains(., "Add Supplier")]
    Wait Until Page Contains    Product Catalog    10s
    Capture Page Screenshot

Business Admin Can Create Product
    Login As Business Admin
    Go To    ${ADMIN_CREATE_URL}
    Wait Until Page Contains    Create A New Product    10s
    Input Text    xpath=//input[@placeholder="Product name"]    ${NEW_PRODUCT_NAME}
    Select From List By Label    xpath=//select[@name="category"]    Coffee
    Select Supplier If Available
    Input Text    xpath=//textarea[@placeholder="Product description"]    Robot-created product for UX5.2 validation
    Input Text    xpath=//input[@placeholder="SKU"]    UITEST-SKU-1
    Input Text    xpath=//input[@placeholder="0.00"]    5.99
    Input Text    xpath=//input[@placeholder="Leave blank if not tracked"]    12
    Input Text    xpath=//input[@placeholder="e.g. Small, 12oz, Default (uses product name if blank)"]    Default
    Click Button    xpath=//button[contains(., "Create Product")]
    Wait Until Catalog Loaded
    Wait Until Page Contains Element    xpath=//tr[td[contains(., "${NEW_PRODUCT_NAME}")]]    10s
    Capture Page Screenshot

Business Admin Can Edit Product
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Catalog Loaded
    Open Product Edit Form    ${NEW_PRODUCT_NAME}
    Wait Until Page Contains    Edit Product    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Product name"]    10s
    Clear Element Text    xpath=//input[@placeholder="Product name"]
    Input Text    xpath=//input[@placeholder="Product name"]    ${UPDATED_PRODUCT_NAME}
    Click Button    xpath=//button[contains(., "Update Product")]
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    ${UPDATED_PRODUCT_NAME}    10s
    Capture Page Screenshot

Business Admin Can Add Variant Inline
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Catalog Loaded
    Expand Options For Product    ${UPDATED_PRODUCT_NAME}
    Wait Until Page Contains    Options for ${UPDATED_PRODUCT_NAME}    10s
    Input Text    xpath=//input[@placeholder="Variant name"]    ${NEW_VARIANT_NAME}
    Input Text    xpath=//input[@placeholder="SKU"]    ${NEW_VARIANT_SKU}
    Input Text    xpath=//input[@placeholder="Unit price"]    6.49
    Input Text    xpath=//input[@placeholder="Stock quantity"]    8
    Input Text    xpath=//input[@placeholder="Reorder level"]    2
    Click Button    xpath=//button[contains(., "Add Option")]
    Wait Until Page Contains    ${NEW_VARIANT_NAME}    10s
    Wait Until Page Contains    ${NEW_VARIANT_SKU}    10s
    Capture Page Screenshot

Business Admin Can Edit Variant Inline
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Catalog Loaded
    Expand Options For Product    ${UPDATED_PRODUCT_NAME}
    Wait Until Page Contains    ${NEW_VARIANT_NAME}    10s
    Click Variant Action Button    ${NEW_VARIANT_NAME}    Edit
    Wait Until Page Contains    Edit Option for ${UPDATED_PRODUCT_NAME}    10s
    Clear Element Text    xpath=//input[@placeholder="Variant name"]
    Input Text    xpath=//input[@placeholder="Variant name"]    ${UPDATED_VARIANT_NAME}
    Click Button    xpath=//button[contains(., "Save Option")]
    Wait Until Page Contains    ${UPDATED_VARIANT_NAME}    10s
    Capture Page Screenshot

Business Admin Can Delete Variant Inline
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Catalog Loaded
    Expand Options For Product    ${UPDATED_PRODUCT_NAME}
    Wait Until Page Contains    ${NEW_VARIANT_SKU}    10s
    Click Variant Action Button    ${UPDATED_VARIANT_NAME}    Delete
    Handle Alert    ACCEPT
    Reload Page
    Wait Until Catalog Loaded
    Expand Options For Product    ${UPDATED_PRODUCT_NAME}
    Wait Until Page Does Not Contain Element    xpath=//tr[td[contains(normalize-space(.), "${NEW_VARIANT_SKU}")]]    10s
    Capture Page Screenshot

Business Admin Can Delete Product
    Login As Business Admin
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Catalog Loaded
    Click Product Action Button    ${UPDATED_PRODUCT_NAME}    Delete
    Handle Alert    ACCEPT
    Wait Until Page Does Not Contain    ${UPDATED_PRODUCT_NAME}    10s
    Capture Page Screenshot

*** Keywords ***
Open Browser To Admin Login
    Open Browser    ${ADMIN_LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Set Window Size    ${BROWSER_WIDTH}    ${BROWSER_HEIGHT}
    Set Selenium Timeout    10s
    Set Selenium Speed    0.1s

Go To Admin Login
    Go To    ${ADMIN_LOGIN_URL}
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains Element    id=email    10s
    Wait Until Page Contains Element    id=password    10s

Login As Business Admin
    Go To Admin Login
    Input Text    id=email    ${BUSINESS_EMAIL}
    Input Password    id=password    ${BUSINESS_PASSWORD}
    Click Button    xpath=//button[contains(., "Sign In")]
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains Element    xpath=//nav[contains(@class, "admin-nav-cards")]    10s

Wait Until Catalog Loaded
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder="Search products..."]    10s

Select Supplier If Available
    ${supplier_count}=    Get Element Count    xpath=//select[@name="supplier"]/option
    Run Keyword If    ${supplier_count} > 1    Select From List By Index    xpath=//select[@name="supplier"]    1

Open Product Edit Form
    [Arguments]    ${product_name}
    Click Product Action Button    ${product_name}    Edit

Expand Options For Product
    [Arguments]    ${product_name}
    Click Product Action Button    ${product_name}    Edit Options

Click Product Action Button
    [Arguments]    ${product_name}    ${button_text}
    ${row_xpath}=    Set Variable    //tr[td[contains(normalize-space(.), "${product_name}")]]
    Wait Until Page Contains Element    xpath=${row_xpath}    10s
    Click Button    xpath=${row_xpath}//button[contains(normalize-space(.), "${button_text}")]

Click Variant Action Button
    [Arguments]    ${variant_name}    ${button_text}
    ${variant_row_xpath}=    Set Variable    //tr[td[contains(normalize-space(.), "${variant_name}")]]
    Wait Until Page Contains Element    xpath=${variant_row_xpath}    10s
    Click Button    xpath=${variant_row_xpath}//button[contains(normalize-space(.), "${button_text}")]