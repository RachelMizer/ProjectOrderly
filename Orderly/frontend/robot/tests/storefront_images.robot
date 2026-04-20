*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
Seeded Storefront Products Show Images
    Go To    ${BASE_URL}
    Wait Until Page Contains    Filter the Menu    10s
    Wait Until Page Contains Element    css=.product-card    10s
    Wait Until Page Contains Element    css=.product-card img    10s

    Product Image Should Exist    Blueberry Muffin
    Product Image Should Exist    Breakfast Sandwich
    Product Image Should Exist    Mocha

Seeded Storefront Products Use Media Image Paths
    Go To    ${BASE_URL}
    Wait Until Page Contains    Filter the Menu    10s
    Wait Until Page Contains Element    css=.product-card img    10s

    Product Image Src Should Contain Media Path    Blueberry Muffin
    Product Image Src Should Contain Media Path    Breakfast Sandwich
    Product Image Src Should Contain Media Path    Mocha

*** Keywords ***
Product Image Should Exist
    [Arguments]    ${product_name}
    Wait Until Page Contains Element    xpath=//img[@alt="${product_name}"]    10s

Product Image Src Should Contain Media Path
    [Arguments]    ${product_name}
    Wait Until Page Contains Element    xpath=//img[@alt="${product_name}"]    10s
    ${src}=    Get Element Attribute    xpath=//img[@alt="${product_name}"]    src
    Should Contain    ${src}    /media/products/