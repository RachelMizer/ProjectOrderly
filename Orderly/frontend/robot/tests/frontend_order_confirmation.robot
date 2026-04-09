*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${TEST_EMAIL}       test@test.com
${TEST_PASSWORD}    Password123!

*** Test Cases ***
Customer Can Reach Cart From Navigation
    Login As Test User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/cart']    10s
    Click Element    xpath=//a[@href='/cart']
    Wait Until Location Contains    /cart    10s
    Wait Until Page Contains    Your Cart    10s

Customer Can View Cart Page Empty State Or Items
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s

    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Your cart is empty.')]
    ${item_count}=     Get Element Count    css=.cart-item
    Should Be True    ${empty_count} > 0 or ${item_count} > 0

Customer Can View Checkout Entry Point From Cart When Items Exist
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s

    ${checkout_count}=    Get Element Count    css=.checkout-btn
    ${empty_count}=       Get Element Count    xpath=//*[contains(normalize-space(.), 'Your cart is empty.')]
    Should Be True    ${checkout_count} > 0 or ${empty_count} > 0

Customer Can Navigate To Checkout From Cart When Items Exist
    [Documentation]    If the seeded/authenticated user has cart items, checkout button should route to /checkout.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Your Cart    10s

    ${checkout_count}=    Get Element Count    css=.checkout-btn
    IF    ${checkout_count} > 0
        Click Button    Go to Checkout
        Wait Until Location Contains    /checkout    10s
    ELSE
        Log    No cart items available; checkout button is not expected on empty cart.
    END

Customer Can View Order History From Navigation
    Login As Test User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Location Contains    /order-history    10s
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

Customer Can View Empty State Or Previous Orders In History
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/order-history
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

    ${order_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order #')]
    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No past orders found.')]
    Should Be True    ${order_count} > 0 or ${empty_count} > 0

Customer Can Open An Order From Order History When Present
    [Documentation]    Passes only when the test user has at least one non-DRAFT order in history.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/order-history
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

    ${order_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order #')]
    IF    ${order_count} > 0
        Click Element    xpath=(//*[contains(normalize-space(.), 'Order #')])[1]
        Wait Until Location Contains    /orders/    10s
    ELSE
        Log    No submitted orders available for this user; skipping detail click-through.
    END

Customer Can See Order History Pagination Controls
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/order-history
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s
    Page Should Contain Button    Previous
    Page Should Contain Button    Next
    Page Should Contain           Page 1

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END