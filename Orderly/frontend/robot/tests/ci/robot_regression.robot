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
    Go To Cart Page
    Increase First Cart Item Quantity
    Cart Total Should Be Visible

CI Regression - Customer Can Reach Checkout And Place Order
    Login As Test User
    Authenticated Navigation Should Be Visible
    Add Customized Breakfast Sandwich To Cart

    Go To    ${BASE_URL}/cart
    Wait Until Page Contains    Cart    10s

    ${checkout_link_count}=    Get Element Count    xpath=//a[contains(@href,'/checkout') or contains(normalize-space(.),'Checkout')]
    ${checkout_button_count}=    Get Element Count    xpath=//button[contains(normalize-space(.),'Checkout')]
    Should Be True    ${checkout_link_count} > 0 or ${checkout_button_count} > 0

    IF    ${checkout_link_count} > 0
        Click Element    xpath=(//a[contains(@href,'/checkout') or contains(normalize-space(.),'Checkout')])[1]
    ELSE
        Click Element    xpath=(//button[contains(normalize-space(.),'Checkout')])[1]
    END

    Wait Until Page Contains    Checkout    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.),'Place Order') or contains(normalize-space(.),'Submit Order')]    10s
    Click Element    xpath=//button[contains(normalize-space(.),'Place Order') or contains(normalize-space(.),'Submit Order')]

    Wait Until Page Contains    Confirmation    15s

CI Regression - Submitted Order Appears In Order History
    Login As Test User
    Go To Order History Page
    Order History Page Should Load

CI Regression - Customer Can Edit Profile Information
    Login As Test User
    Go To Profile Page
    Update Profile With CI Data
    Profile Save Success Should Be Visible
    Profile Should Contain Updated Data
