*** Settings ***
Library    Browser

Suite Setup       Open Browser To App
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:3000
${EMAIL}          orderhistory1@test.com
${PASSWORD}       Password123!

*** Keywords ***
Open Browser To App
    New Browser    chromium    headless=False
    New Context
    New Page    ${BASE_URL}/

Login As Existing User
    Wait For Elements State    css=a[href="/login"]    visible    10s
    Click    css=a[href="/login"]

    Wait For Elements State    css=input#email    visible    10s
    Fill Text    css=input#email    ${EMAIL}
    Fill Text    css=input#password    ${PASSWORD}

    Click    css=button[type="submit"]

    Wait For Elements State    css=a[href="/order-history"]    visible    10s
    Wait For Elements State    css=a[href="/profile"]    visible    10s

Go To Order History Page
    Click    css=a[href="/order-history"]
    Wait For Elements State    role=heading[name="Order History"]    visible    10s

Open First Order From History
    Wait For Elements State    xpath=(//strong[starts-with(normalize-space(),'Order #')])[1]    visible    10s
    Click    xpath=(//strong[starts-with(normalize-space(),'Order #')])[1]

Validate Order Confirmation Details
    # Confirm we are on order detail page
    Wait For Elements State    xpath=//h2[starts-with(normalize-space(),'Order #')]    visible    10s

    ${heading}=    Get Text    xpath=//h2[starts-with(normalize-space(),'Order #')]
    Should Contain    ${heading}    Order #

    ${page_text}=    Get Text    css=body

    # Core receipt fields
    Should Contain    ${page_text}    Date:
    Should Contain    ${page_text}    Status:
    Should Contain    ${page_text}    Items
    Should Contain    ${page_text}    Totals
    Should Contain    ${page_text}    Total:

    # Item-level validation (based on your screenshot)
    Should Contain    ${page_text}    Quantity:
    Should Contain    ${page_text}    Unit Price:
    Should Contain    ${page_text}    Item Total:

    # Optional (stronger check if consistent data exists)
    Should Contain    ${page_text}    Classic Burger

*** Test Cases ***
Customer Can View Order Confirmation From Order History
    [Documentation]    US3.4.1 - Confirmation is visible by opening an order from order history
    Login As Existing User
    Go To Order History Page
    Open First Order From History
    Validate Order Confirmation Details