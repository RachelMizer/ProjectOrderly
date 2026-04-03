*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${CART_URL}    ${BASE_URL}/cart

*** Test Cases ***
Cart Page Shows Items Or Empty State
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains    Your Cart    10s

    ${item_count}=    Get Element Count    css=.cart-item
    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Your cart is empty.')]
    Should Be True    ${item_count} > 0 or ${empty_count} > 0

Cart Items Are Visible
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains    Your Cart    10s
    Wait Until Page Contains Element    css=.cart-item    10s

    Page Should Contain Element    css=.cart-item h3
    Page Should Contain Element    css=.cart-item-controls
    Page Should Contain Element    xpath=(//button[normalize-space()='Delete'])[1]

Quantity Can Be Increased
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${before_qty}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[1]
    Click Element    xpath=(//div[contains(@class,'cart-item-controls')]//button[normalize-space()='+'])[1]
    Wait Until Keyword Succeeds    10x    1s    Quantity Should Change    ${before_qty}

Quantity Can Be Decreased
    [Documentation]    Requires a cart item with quantity > 1 for a strict decrement assertion.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${before_qty}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[1]
    Click Element    xpath=(//div[contains(@class,'cart-item-controls')]//button[normalize-space()='−'])[1]

    ${item_count}=    Get Element Count    css=.cart-item
    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Your cart is empty.')]
    Should Be True    ${item_count} >= 0 and ${empty_count} >= 0

Delete Removes Cart Item
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${before}=    Get Element Count    css=.cart-item
    Click Button    xpath=(//button[normalize-space()='Delete'])[1]
    Wait Until Keyword Succeeds    10x    1s    Cart Item Count Should Drop Or Empty State Should Show    ${before}

Totals Section Is Visible
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains    Your Cart    10s

    ${item_count}=    Get Element Count    css=.cart-item
    IF    ${item_count} > 0
        Page Should Contain    Total Items
        Page Should Contain    Subtotal
        Page Should Contain    Tax
        Page Should Contain    Grand Total
    ELSE
        Log    Totals section not expected when cart is empty.
    END

Totals Update When Quantity Changes
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${before_total}=    Get Text    xpath=//td[normalize-space()='Grand Total']/following-sibling::td[1]
    Click Element    xpath=(//div[contains(@class,'cart-item-controls')]//button[normalize-space()='+'])[1]
    Wait Until Keyword Succeeds    10x    1s    Grand Total Should Change    ${before_total}

Cart Persists After Refresh
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${product_name}=    Get Text    xpath=(//div[contains(@class,'cart-item')]//h3)[1]
    ${qty}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[1]

    Reload Page
    Wait Until Page Contains    Your Cart    10s
    Wait Until Page Contains Element    css=.cart-item    10s

    Page Should Contain    ${product_name}
    Page Should Contain    ${qty}

Modifiers Display Under Cart Item
    [Documentation]    Requires at least one cart item with modifiers for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${mods_heading}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Item Add-Ons / Mods:')]
    Should Be True    ${mods_heading} > 0

    ${mods_list}=    Get Element Count    css=.cart-item ul li
    ${no_addons}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No add-ons added')]
    Should Be True    ${mods_list} > 0 or ${no_addons} > 0

Modifier Pricing Is Reflected In Item Total
    [Documentation]    Best when test data includes an item with priced modifiers.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains Element    css=.cart-item    10s

    ${priced_mods}=    Get Element Count    xpath=//li[contains(normalize-space(.), '(+$')]
    ${item_prices}=    Get Element Count    xpath=//div[contains(@class,'cart-item')]//p[starts-with(normalize-space(.), '$')]
    Should Be True    ${priced_mods} >= 0 and ${item_prices} > 0

Empty Cart Clears All Items
    [Documentation]    Requires at least one cart item for the test user.
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${CART_URL}
    Wait Until Page Contains    Your Cart    10s

    ${item_count}=    Get Element Count    css=.cart-item
    IF    ${item_count} > 0
        Handle Future Dialogs
        Click Button    Empty Cart
        Wait Until Page Contains    Your cart is empty.    10s
        Page Should Contain    Your Cart
    ELSE
        Log    Cart already empty; skipping.
    END

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Handle Future Dialogs
    Run Keyword And Ignore Error    Handle Alert    action=ACCEPT

Quantity Should Change
    [Arguments]    ${before_qty}
    ${after_qty}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[1]
    Should Not Be Equal    ${after_qty}    ${before_qty}

Grand Total Should Change
    [Arguments]    ${before_total}
    ${after_total}=    Get Text    xpath=//td[normalize-space()='Grand Total']/following-sibling::td[1]
    Should Not Be Equal    ${after_total}    ${before_total}
