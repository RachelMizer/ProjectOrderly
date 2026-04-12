*** Settings ***
Documentation    Admin product management tests for US4.3 / UX5.2 (UPDATED)
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${ADMIN_CATALOG_URL}    ${BASE_URL}/admin/catalog

*** Test Cases ***
Admin Products Page Requires Login
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s

Customer Cannot Access Admin Products
    Login As Customer User
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s

Business User Can Access Admin Products
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//input[@placeholder='Search products...']    10s
    Wait Until Page Contains    Welcome,    10s

Admin Can Navigate To Create Product Page
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//button[contains(., 'CREATE NEW PRODUCT')]    10s
    Click Element    xpath=//button[contains(., 'CREATE NEW PRODUCT')]

    Wait Until Location Contains    /admin/catalog/new    10s
    Wait Until Page Contains    Create A New Product    10s

Admin Can Navigate To Edit Product Page
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//button[normalize-space()='Edit']    10s
    Click Element    xpath=(//button[normalize-space()='Edit'])[1]

    Wait Until Location Contains    /admin/catalog/edit    10s
    Wait Until Page Contains    Update Product    10s

Admin Can Delete Product
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]//tr[td]    10s

    ${product}=    Get Text    xpath=(//table[contains(@class,'admin-table')]//tr[td])[1]/td[2]
    Click Element    xpath=((//table[contains(@class,'admin-table')]//tr[td])[1]//button[normalize-space()='Delete'])[1]
    Handle Alert    ACCEPT

    Reload Page
    Wait Until Page Contains Element    xpath=//input[@placeholder='Search products...']    10s
    Wait Until Page Does Not Contain    ${product}    10s

Admin Can Expand Options Panel
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options']    10s
    Click Element    xpath=(//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options'])[1]

    Wait Until Page Contains    Options for    10s

Admin Can Add Variant Inline
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options']    10s
    Click Element    xpath=(//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options'])[1]
    Wait Until Page Contains    Options for    10s

    ${unique}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${variant_name}=    Set Variable    Robot Variant ${unique}
    ${variant_sku}=     Set Variable    ROBOT-${unique}

    Input Text    xpath=//input[@placeholder='Variant name']    ${variant_name}
    Input Text    xpath=//input[@placeholder='SKU']    ${variant_sku}
    Input Text    xpath=//input[@placeholder='Unit price']    5.00
    Input Text    xpath=//input[@placeholder='Stock quantity']    8
    Input Text    xpath=//input[@placeholder='Reorder level']    2

    Click Element    xpath=//button[normalize-space()='Add Option']

    Wait Until Page Contains    ${variant_name}    10s
    Wait Until Page Contains    ${variant_sku}    10s

Admin Can Delete Variant Inline
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options']    10s
    Click Element    xpath=(//table[contains(@class,'admin-table')]//button[normalize-space()='Edit Options'])[1]
    Wait Until Page Contains    Options for    10s

    ${unique}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${variant_name}=    Set Variable    Robot Delete Variant ${unique}
    ${variant_sku}=     Set Variable    ROBOT-DEL-${unique}

    Input Text    xpath=//input[@placeholder='Variant name']    ${variant_name}
    Input Text    xpath=//input[@placeholder='SKU']    ${variant_sku}
    Input Text    xpath=//input[@placeholder='Unit price']    5.00
    Input Text    xpath=//input[@placeholder='Stock quantity']    8
    Input Text    xpath=//input[@placeholder='Reorder level']    2
    Click Element    xpath=//button[normalize-space()='Add Option']

    Wait Until Page Contains    ${variant_sku}    10s

    Click Element    xpath=//tr[td[normalize-space()='${variant_sku}']]/td/following-sibling::td//button[normalize-space()='Delete']
    Handle Alert    ACCEPT

    Wait Until Page Does Not Contain    ${variant_sku}    10s