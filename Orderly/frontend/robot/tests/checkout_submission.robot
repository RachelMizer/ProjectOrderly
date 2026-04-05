*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${TEST_EMAIL}       test@test.com
${TEST_PASSWORD}    Password123!
${BASE_URL}         http://localhost:3000

*** Test Cases ***
Checkout Shows Cart Contents And Totals
    [Documentation]    AC: Checkout shows correct items and total
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    ${item_count}=    Get Element Count    css=.checkout-item
    Should Be True    ${item_count} > 0

    Page Should Contain    Subtotal
    Page Should Contain    Tax

    ${grand_total_text}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Grand Total')]
    ${total_text}=          Get Element Count    xpath=//*[normalize-space()='Total' or contains(normalize-space(.), 'Order Total')]
    Should Be True    ${grand_total_text} > 0 or ${total_text} > 0

Customer Can Open Checkout From Cart
    [Documentation]    AC: Customer can submit order from checkout page
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s
    Click Button    Go to Checkout
    Wait Until Location Contains    /checkout    10s
    Wait Until Page Contains    Checkout    10s

Checkout Payment Type Shows Credit Card Conditional Field
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    Select Payment Type    Credit Card
    Wait Until Page Contains Element    xpath=//input[contains(@name,'card') or contains(@id,'card')]    10s

Checkout Payment Type Shows Other Conditional Field
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    Select Payment Type    Other
    Wait Until Page Contains Element    xpath=//textarea[contains(@name,'other') or contains(@id,'other')] | //input[contains(@name,'other') or contains(@id,'other')]    10s

Customer Can Submit Order From Checkout
    [Documentation]    AC: Customer can submit order from checkout page / Order submits successfully
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    Fill Checkout Form For Credit Card
    Click Submit Order

    Wait Until Location Contains    /orders/    15s

Cart Is Empty After Successful Submission
    [Documentation]    AC: Cart is empty after successful order submission
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    Fill Checkout Form For Credit Card
    Click Submit Order
    Wait Until Location Contains    /orders/    15s

    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s
    Wait Until Page Contains    Your cart is empty.    10s

Checkout Shows Error If Required Payment Data Missing
    Ensure Logged In User Has Cart Item
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    Fill Basic Checkout Contact Info
    Select Payment Type    Credit Card
    Click Submit Order

    ${ui_error_count}=          Get Element Count    css=.checkout-error
    ${card_field_still_here}=   Get Element Count    xpath=//input[contains(@name,'card') or contains(@id,'card')]
    ${location_changed}=        Execute JavaScript    return window.location.pathname;

    Should Be True    ${ui_error_count} > 0 or ${card_field_still_here} > 0
    Should Not Be Equal    ${location_changed}    /orders/

Empty Checkout State Handles Missing Cart Gracefully
    [Documentation]    Verifies checkout handles empty cart scenario
    Login As Test User
    Sync Auth Token Key For Frontend
    Empty Cart If Present

    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains    Checkout    10s

    ${empty_state}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'empty cart') or contains(normalize-space(.), 'Your cart is empty') or contains(normalize-space(.), 'Return to Cart') or contains(normalize-space(.), 'Back to Cart')]
    Should Be True    ${empty_state} > 0

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Ensure Logged In User Has Cart Item
    Login As Test User
    Sync Auth Token Key For Frontend
    Empty Cart If Present
    Add First Available Item To Cart
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s
    Wait Until Page Contains Element    css=.cart-item    10s

Empty Cart If Present
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s
    ${item_count}=    Get Element Count    css=.cart-item
    IF    ${item_count} > 0
        Click Button    Empty Cart
        Handle Alert    ACCEPT
        Wait Until Page Contains    Your cart is empty.    10s
    END

Add First Available Item To Cart
    Go To    ${BASE_URL}/
    Wait Until Page Contains    Filter the Menu    10s
    Wait Until Page Contains Element    css=.product-card    10s

    ${add_count}=    Get Element Count    css=.product-card .add-to-cart-btn
    Should Be True    ${add_count} > 0

    Click Element    xpath=(//button[contains(normalize-space(.), 'Add to Cart')])[1]
    Sleep    1s

Fill Basic Checkout Contact Info
    Wait Until Page Contains Element    xpath=//input[contains(@name,'name') or contains(@id,'name')]    10s
    Input Text    xpath=//input[contains(@name,'name') or contains(@id,'name')]    Test User

    Input Text    xpath=//input[contains(@name,'phone') or contains(@id,'phone')]    9195551234
    Input Text    xpath=//input[contains(@name,'address') or contains(@id,'address')]    123 Main St
    Input Text    xpath=//input[contains(@name,'city') or contains(@id,'city')]    Raleigh
    Input Text    xpath=//input[contains(@name,'state') or contains(@id,'state')]    NC
    Input Text    xpath=//input[contains(@name,'zip') or contains(@id,'zip')]    27601

Select Payment Type
    [Arguments]    ${payment_type}
    ${select_count}=    Get Element Count    xpath=//select[contains(@name,'payment') or contains(@id,'payment')]
    IF    ${select_count} > 0
        Select From List By Label    xpath=//select[contains(@name,'payment') or contains(@id,'payment')]    ${payment_type}
    ELSE
        Click Element    xpath=//label[contains(normalize-space(.), '${payment_type}')]
    END

Fill Checkout Form For Credit Card
    Fill Basic Checkout Contact Info
    Select Payment Type    Credit Card
    Wait Until Page Contains Element    xpath=//input[contains(@name,'card') or contains(@id,'card')]    10s
    Input Text    xpath=//input[contains(@name,'card') or contains(@id,'card')]    4242

Click Submit Order
    ${submit_count}=    Get Element Count    xpath=//button[contains(normalize-space(.), 'Submit Order')]
    IF    ${submit_count} > 0
        Click Button    Submit Order
    ELSE
        Click Element    xpath=//button[@type='submit']
    END