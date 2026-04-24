*** Settings ***
Documentation    Combined CI regression suite for seeded Orderly data.
Resource         keywords_ci_regression.robot
Test Setup       Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
CI Regression - User Can Log In And Log Out
    Login As Test User
    Auth Token Should Exist
    Authenticated Navigation Should Be Visible
    Logout User
    Login Form Should Be Visible

CI Regression - Product Browsing Loads Seeded Storefront
    Go To Storefront
    Page Should Contain    ${LATTE_PRODUCT}
    Page Should Contain    ${BREAKFAST_PRODUCT}
    Page Should Contain Element    css=.product-grid
    Page Should Contain Element    css=.product-card

CI Regression - Customer Can Add Customized Item To Cart
    Login As Test User
    Add Breakfast Sandwich With Modifiers To Cart
    Go To Cart Page
    Cart Should Contain At Least One Item
    Page Should Contain    ${BREAKFAST_PRODUCT}
    Cart Should Show Modifier Section Or Simple Item State

CI Regression - Customer Can Update Cart Quantity
    Login As Test User
    Ensure Cart Has Item

    ${before}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[2]
    Click Element    xpath=(//div[contains(@class,'cart-item-controls')]/button[normalize-space()='+'])[1]
    Wait Until Keyword Succeeds    10x    1s    Quantity Should Change    ${before}

CI Regression - Customer Can Reach Checkout And Place Order
    Login As Test User
    Authenticated Navigation Should Be Visible

    Ensure Cart Has Item
    Go To Cart Page

    Wait Until Page Contains    Your Cart    10s
    Wait Until Page Contains Element    css=.checkout-btn    10s
    Click Element    css=.checkout-btn

    Wait Until Page Contains    Checkout    10s

    Input Text    id=name       CI Test User
    Input Text    id=phone      9195551234
    Input Text    id=address    123 Test Street
    Input Text    id=city       Raleigh
    Input Text    id=state      NC
    Input Text    id=zip        27601
    Select From List By Value    id=paymentType    CASH

    Wait Until Page Contains Element    css=.submit-order-btn    10s
    Click Element    css=.submit-order-btn

    Wait Until Location Contains    /orders/    15s
    Wait Until Page Contains    Status:    10s
    Wait Until Page Contains    Order #    10s
    Page Should Contain    Status
    Page Should Contain    Total

CI Regression - Submitted Order Appears In Order History
    Login As Test User
    Go To    ${BASE_URL}/order-history

    Wait Until Page Contains    Order History    10s
    Wait Until Page Contains Element    xpath=//tr[contains(@class,'order-hist-row')]    15s

    ${order_count}=    Get Element Count    xpath=//tr[contains(@class,'order-hist-row')]
    Should Be True    ${order_count} > 0

CI Regression - Customer Can Edit Profile Information
    Login As Test User
    Go To    ${BASE_URL}/profile

    Wait Until Page Contains Element    id=firstName    10s

    Press Keys    id=firstName    CTRL+a
    Press Keys    id=firstName    BACKSPACE
    Input Text    id=firstName    KennyCI

    Press Keys    id=lastName    CTRL+a
    Press Keys    id=lastName    BACKSPACE
    Input Text    id=lastName    TesterCI

    Press Keys    id=streetAddress    CTRL+a
    Press Keys    id=streetAddress    BACKSPACE
    Input Text    id=streetAddress    123 CI Street

    Press Keys    id=city    CTRL+a
    Press Keys    id=city    BACKSPACE
    Input Text    id=city    Raleigh

    Press Keys    id=state    CTRL+a
    Press Keys    id=state    BACKSPACE
    Input Text    id=state    NC

    Press Keys    id=zipcode    CTRL+a
    Press Keys    id=zipcode    BACKSPACE
    Input Text    id=zipcode    27601

    Press Keys    id=phone    CTRL+a
    Press Keys    id=phone    BACKSPACE
    Input Text    id=phone    9195551234

    Click Button    xpath=//button[contains(., 'Save')]

    Wait Until Keyword Succeeds    10s    1s
    ...    Textfield Value Should Be    id=firstName    KennyCI

CI Regression - View And Customize Opens Product Page
    Go To Storefront
    Wait Until Page Contains    Filters    10s
    Wait Until Page Contains Element    xpath=(//a[contains(normalize-space(.), 'View & Customize')])[1]    10s
    Click Element    xpath=(//a[contains(normalize-space(.), 'View & Customize')])[1]
    Wait Until Location Contains    /product/    10s
    Wait Until Page Contains    Add to Cart    10s

CI Regression - Cart Page Loads After Refresh
    Login As Test User

    Go To    ${BASE_URL}/cart
    Wait Until Page Contains Element    xpath=//body    15s

    Reload Page

    Wait Until Page Contains Element    xpath=//body    15s
    Location Should Contain    /cart

CI Regression - Business User Can Open Admin Dashboard
    Login As Business User
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains    Dashboard Home    10s
    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Orders    10s

CI Regression - Logged Out User Is Redirected From Admin
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains    Orderly    10s
    Page Should Contain    Sign In
    Page Should Contain Element    id=email
    Page Should Contain Element    id=password

CI Regression - Customer Cannot Access Admin
    Login As Test User
    Go To    ${BASE_URL}/admin
    Wait Until Keyword Succeeds    10s    1s    Customer Admin Redirect Should Be Visible

CI Regression - Admin Catalog Loads For Business User
    Login As Business User
    Go To    ${BASE_URL}/admin/catalog
    Wait Until Page Contains Element    xpath=//input[@placeholder='Search products...']    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'CREATE NEW PRODUCT')]    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'ADD SUPPLIER')]    10s