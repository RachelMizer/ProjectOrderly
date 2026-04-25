*** Settings ***
Library    SeleniumLibrary    timeout=10
Variables  variables_ci.py

*** Variables ***
${STORE_URL}                 ${BASE_URL}/
${CART_URL}                  ${BASE_URL}/cart
${CHECKOUT_URL}              ${BASE_URL}/checkout
${ORDER_HISTORY_URL}         ${BASE_URL}/order-history
${PROFILE_URL}               ${BASE_URL}/profile
${LATTE_PRODUCT}             Latte
${BREAKFAST_PRODUCT}         Breakfast Sandwich
${SIMPLE_PRODUCT}            Blueberry Muffin
${UPDATED_FIRST_NAME}        KennyCI
${UPDATED_LAST_NAME}         Tester
${UPDATED_STREET}            123 CI Lane
${UPDATED_CITY}              Raleigh
${UPDATED_STATE}             NC
${UPDATED_ZIP}               27601

*** Keywords ***
Open Browser To App
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    IF    ${HEADLESS}
        ${headless_arg}=    Set Variable    --headless=new
        Call Method    ${options}    add_argument    ${headless_arg}
    END
    ${sandbox_arg}=    Set Variable    --no-sandbox
    ${dev_shm_arg}=    Set Variable    --disable-dev-shm-usage
    ${window_arg}=    Set Variable    --window-size=1920,1080
    Call Method    ${options}    add_argument    ${sandbox_arg}
    Call Method    ${options}    add_argument    ${dev_shm_arg}
    Call Method    ${options}    add_argument    ${window_arg}
    Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}
    Set Selenium Timeout    10 seconds

Close Browser Session
    Run Keyword If Test Failed    Capture Page Screenshot
    Close Browser

Capture Page Screenshot On Failure
    Run Keyword If Test Failed    Capture Page Screenshot

Go To Storefront
    Go To    ${STORE_URL}
    Wait Until Page Contains    Filters    15s
    Wait Until Page Contains Element    css=.product-card    15s

Go To Login Page
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    xpath=//input[@type='email' or @id='email']    10s

Login As Test User
    Go To Login Page
    Input Text    xpath=//input[@type='email' or @id='email' or @name='email']    ${TEST_EMAIL}
    Input Password    xpath=//input[@type='password' or @id='password' or @name='password']    ${TEST_PASSWORD}
    Click Button    xpath=//button[@type='submit' or normalize-space()='Login']
    Sync Auth Token Key For Frontend
    Wait Until Keyword Succeeds    12x    1s    Authenticated Navigation Should Be Visible

Login As Business User
    Go To    ${BASE_URL}/admin/login
    Wait Until Page Contains Element    id=email    10s
    Input Text    id=email    business1@example.com
    Input Password    id=password    Password123!
    Click Button    xpath=//button[contains(normalize-space(.), 'Sign In')]
    Wait Until Page Contains    Welcome,    10s

Open Product By Exact Name
    [Arguments]    ${product_name}
    Go To    ${BASE_URL}/
    Wait Until Page Contains    Filters    15s
    Wait Until Page Contains Element    css=.product-card    15s
    Wait Until Page Contains Element    xpath=//div[contains(@class,'product-card')][.//h3[normalize-space()='${product_name}']]    15s
    Click Element    xpath=(//div[contains(@class,'product-card')][.//h3[normalize-space()='${product_name}']]//a[contains(@class,'view-link') or contains(normalize-space(.),'View')])[1]

Select Required Breakfast Sandwich Modifiers
    Wait Until Page Contains    Breakfast Sandwich    15s
    Wait Until Page Contains Element    xpath=//div[contains(@class,'modifier-group')][.//*[contains(normalize-space(.),'Bread Choice')]]    15s

    ${bread_radio_count}=    Get Element Count    xpath=//div[contains(@class,'modifier-group')][.//*[contains(normalize-space(.),'Bread Choice')]]//input[@type='radio']
    Should Be True    ${bread_radio_count} > 0

    Click Element    xpath=(//div[contains(@class,'modifier-group')][.//*[contains(normalize-space(.),'Bread Choice')]]//input[@type='radio'])[1]

    ${protein_checkbox_count}=    Get Element Count    xpath=//div[contains(@class,'modifier-group')][.//*[contains(normalize-space(.),'Protein Add-On')]]//input[@type='checkbox']
    IF    ${protein_checkbox_count} > 0
        Click Element    xpath=(//div[contains(@class,'modifier-group')][.//*[contains(normalize-space(.),'Protein Add-On')]]//input[@type='checkbox'])[1]
    END

Add Customized Breakfast Sandwich To Cart
    Open Product By Exact Name    Breakfast Sandwich
    Select Required Breakfast Sandwich Modifiers
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.),'Add to Cart') or contains(normalize-space(.),'Add To Cart')]    10s
    Click Element    xpath=//button[contains(normalize-space(.),'Add to Cart') or contains(normalize-space(.),'Add To Cart')]

Log Out User
    Click Element    xpath=//button[contains(., 'Logout') or contains(., 'Log Out')]
    Run Keyword And Ignore Error    Handle Alert    ACCEPT
    Wait Until Keyword Succeeds    10x    1s    Logout Should Be Complete

Logout Should Be Complete
    ${on_login}=    Run Keyword And Return Status
    ...    Location Should Contain    /login

    ${login_form}=    Run Keyword And Return Status
    ...    Page Should Contain Element    xpath=//input[@type='password']

    ${login_button}=    Run Keyword And Return Status
    ...    Page Should Contain Element    xpath=//button[@type='submit']

    Should Be True    ${on_login} or ${login_form} or ${login_button}

Login Form Should Be Visible
    Page Should Contain Element    xpath=//input[@type='email' or @id='email' or @name='email']
    Page Should Contain Element    xpath=//input[@type='password' or @id='password' or @name='password']

Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Auth Token Should Exist
    ${token}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    Should Not Be Empty    ${token}

Authenticated Navigation Should Be Visible
    Wait Until Page Contains Element    xpath=//a[contains(@href,'/profile')]    10s
    Page Should Contain Element    xpath=//a[contains(@href,'/cart')]

Go To Product By Exact Name
    [Arguments]    ${product_name}
    Go To Storefront
    Wait Until Page Contains    ${product_name}    15s
    Click Element    xpath=//div[contains(@class,'product-card')][.//h3[normalize-space()='${product_name}']]//a[contains(@class,'view-link') or contains(normalize-space(.), 'View')]
    Wait Until Location Contains    /product/    10s
    Wait Until Page Contains Element    css=.ind-product-pg    10s

Add First Available Item To Cart
    Go To Storefront
    ${add_count}=    Get Element Count    css=.product-card .add-to-cart-btn
    Should Be True    ${add_count} > 0
    Click Element    xpath=(//button[contains(normalize-space(.), 'Add to Cart')])[1]
    Sleep    1s

Add Simple Product To Cart
    Go To Storefront
    Wait Until Page Contains    ${SIMPLE_PRODUCT}    15s
    ${card}=    Set Variable    xpath=//div[contains(@class,'product-card')][.//h3[normalize-space()='${SIMPLE_PRODUCT}']]
    ${simple_add}=    Get Element Count    ${card}//button[contains(normalize-space(.),'Add to Cart')]
    IF    ${simple_add} > 0
        Click Element    ${card}//button[contains(normalize-space(.),'Add to Cart')]
        Sleep    1s
    ELSE
        Click Element    ${card}//a[contains(@class,'view-link') or contains(normalize-space(.), 'View')]
        Wait Until Location Contains    /product/    10s
        Add Product From Product Page
    END

Select Breakfast Sandwich Required Modifier
    ${bread_group}=    Set Variable    xpath=//*[contains(normalize-space(.),'Bread Choice')]
    Wait Until Page Contains Element    ${bread_group}    10s
    ${radio_count}=    Get Element Count    css=.modifier-group input[type='radio']
    IF    ${radio_count} > 0
        Click Element    xpath=(//div[contains(@class,'modifier-group')]//input[@type='radio'])[1]
    ELSE
        Click Element    xpath=(//div[contains(@class,'modifier-option')])[1]
    END
    ${checkbox_count}=    Get Element Count    css=.modifier-group input[type='checkbox']
    IF    ${checkbox_count} > 0
        Click Element    xpath=(//div[contains(@class,'modifier-group')]//input[@type='checkbox'])[1]
    END

Add Product From Product Page
    ${add_count}=    Get Element Count    xpath=//button[contains(normalize-space(.),'Add to Cart')]
    Should Be True    ${add_count} > 0
    Click Button    xpath=//button[contains(normalize-space(.),'Add to Cart')]
    Sleep    1s

Add Breakfast Sandwich With Modifiers To Cart
    Go To Product By Exact Name    ${BREAKFAST_PRODUCT}
    Select Breakfast Sandwich Required Modifier
    Add Product From Product Page

Go To Cart Page
    Go To    ${CART_URL}
    Wait Until Page Contains    Your Cart    10s


Cart Should Contain At Least One Item
    ${item_count}=    Get Element Count    css=.cart-item
    Should Be True    ${item_count} > 0

Cart Should Show Modifier Section Or Simple Item State
    ${mods_heading}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Item Add-Ons / Mods:')]
    ${mods_list}=    Get Element Count    css=.cart-item ul li
    ${simple_items}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No add-ons added')]
    Should Be True    ${mods_heading} > 0 or ${mods_list} > 0 or ${simple_items} > 0

Increase First Cart Item Quantity
    ${before_qty}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[1]
    Click Element    xpath=(//div[contains(@class,'cart-item-controls')]//button[normalize-space()='+'])[1]
    Wait Until Keyword Succeeds    10x    1s    Quantity Should Change    ${before_qty}


Cart Total Should Be Visible
    Page Should Contain    Total

Go To Checkout Page
    Go To    ${CHECKOUT_URL}
    Wait Until Page Contains    Checkout    10s

Go To Checkout From Cart
    Go To Cart Page
    ${checkout_btn}=    Get Element Count    xpath=//button[contains(normalize-space(.), 'Go to Checkout') or contains(normalize-space(.), 'Checkout')]
    Should Be True    ${checkout_btn} > 0
    Click Element    xpath=//button[contains(normalize-space(.), 'Go to Checkout') or contains(normalize-space(.), 'Checkout')]
    Wait Until Location Contains    /checkout    10s
    Wait Until Page Contains    Checkout    10s

Fill Basic Checkout Contact Info
    Wait Until Page Contains Element    xpath=//input[contains(@name,'name') or contains(@id,'name')]    10s
    Clear Element Text    xpath=//input[contains(@name,'name') or contains(@id,'name')]
    Input Text    xpath=//input[contains(@name,'name') or contains(@id,'name')]    Test User
    Clear Element Text    xpath=//input[contains(@name,'phone') or contains(@id,'phone')]
    Input Text    xpath=//input[contains(@name,'phone') or contains(@id,'phone')]    9195551234
    Clear Element Text    xpath=//input[contains(@name,'address') or contains(@id,'address')]
    Input Text    xpath=//input[contains(@name,'address') or contains(@id,'address')]    123 Main St
    Clear Element Text    xpath=//input[contains(@name,'city') or contains(@id,'city')]
    Input Text    xpath=//input[contains(@name,'city') or contains(@id,'city')]    Raleigh
    Clear Element Text    xpath=//input[contains(@name,'state') or contains(@id,'state')]
    Input Text    xpath=//input[contains(@name,'state') or contains(@id,'state')]    NC
    Clear Element Text    xpath=//input[contains(@name,'zip') or contains(@id,'zip')]
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

Submit Order
    ${submit_count}=    Get Element Count    xpath=//button[contains(normalize-space(.), 'Submit Order')]
    IF    ${submit_count} > 0
        Click Button    Submit Order
    ELSE
        Click Element    xpath=//button[@type='submit']
    END

Order Confirmation Should Be Visible
    Wait Until Location Contains    /orders/    15s
    ${confirmation}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order Confirmation') or contains(normalize-space(.), 'Order #') or contains(normalize-space(.), 'Thank you')]
    Should Be True    ${confirmation} > 0

Go To Order History Page
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

Order History Page Should Load
    Page Should Contain    Order History
    ${order_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order #')]
    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No past orders found.')]
    Should Be True    ${order_count} > 0 or ${empty_count} > 0

Go To Profile Page
    Go To    ${PROFILE_URL}
    Wait Until Page Contains Element    id=firstName    10s

Update Profile With CI Data
    ${stamp}=    Evaluate    str(__import__('time').time()).replace('.','')[-6:]
    ${phone}=    Set Variable    91955${stamp}
    Clear Element Text    id=firstName
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Clear Element Text    id=lastName
    Input Text    id=lastName    ${UPDATED_LAST_NAME}
    Clear Element Text    id=streetAddress
    Input Text    id=streetAddress    ${UPDATED_STREET}
    Clear Element Text    id=city
    Input Text    id=city    ${UPDATED_CITY}
    Clear Element Text    id=state
    Input Text    id=state    ${UPDATED_STATE}
    Clear Element Text    id=zipcode
    Input Text    id=zipcode    ${UPDATED_ZIP}
    Clear Element Text    id=phone
    Input Text    id=phone    ${phone}
    Click Button    xpath=//button[normalize-space()='Save' or @type='submit']
    Set Suite Variable    ${CI_PHONE}    ${phone}

Profile Save Success Should Be Visible
    Wait Until Page Contains    Profile updated successfully    10s

Profile Should Contain Updated Data
    Reload Page
    Wait Until Page Contains Element    id=phone    10s
    Textfield Value Should Be    id=firstName    ${UPDATED_FIRST_NAME}
    Textfield Value Should Be    id=city    ${UPDATED_CITY}
    Textfield Value Should Be    id=phone    ${CI_PHONE}

Customer Admin Redirect Should Be Visible
    ${login_visible}=    Run Keyword And Return Status    Page Should Contain    Sign In
    ${store_visible}=    Run Keyword And Return Status    Page Should Contain    Filters
    Should Be True    ${login_visible} or ${store_visible}
    Page Should Not Contain    Dashboard Home

Quantity Should Change
    [Arguments]    ${before}
    ${after}=    Get Text    xpath=(//div[contains(@class,'cart-item-controls')]/span)[2]
    Should Not Be Equal    ${before}    ${after}

Ensure Cart Has Item
    Go To    ${BASE_URL}/cart
    ${has_item}=    Run Keyword And Return Status
    ...    Wait Until Page Contains Element    xpath=//div[contains(@class,'cart-item')]    3s

    IF    not ${has_item}
        Go To    ${BASE_URL}/product/1
        Wait Until Page Contains Element    xpath=//button[contains(., 'Add to Cart')]    15s
        Click Element    xpath=//button[contains(., 'Add to Cart')]
        Go To    ${BASE_URL}/cart
        Wait Until Page Contains Element    xpath=//div[contains(@class,'cart-item')]    15s
    END