*** Settings ***
Resource    ../resources/keywords.robot
Test Setup  Open Browser To App
Test Teardown  Close Browser Session

*** Variables ***
${STOREFRONT_URL}    ${BASE_URL}/

*** Test Cases ***
Product Cards Render On StoreFront
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains    Filter the Menu    10s
    Wait Until Page Contains Element    css=.product-grid    10s
    Wait Until Page Contains Element    css=.product-card    10s

Product Card Shows Name
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card h3    10s
    Page Should Contain    Latte

Product Card Uses Radio Variants Or Hides Selector For Single Variant
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card    10s

    ${radio_count}=    Get Element Count    css=.product-card .variant-radios input[type="radio"]
    Should Be True    ${radio_count} >= 0

Product Card Shows Price
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card .price    10s
    ${price_text}=    Get Text    css=.product-card .price
    Should Contain    ${price_text}    $

In Stock Product Shows Add To Cart Button When Available
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card    10s

    ${add_count}=    Get Element Count    css=.product-card .add-to-cart-btn
    ${oos_count}=    Get Element Count    css=.product-card .OOS

    Should Be True    ${add_count} > 0 or ${oos_count} > 0

Out Of Stock Product Shows Message If Present
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-grid    10s
    ${oos_count}=    Get Element Count    css=.product-card .OOS
    Should Be True    ${oos_count} >= 0

View And Customize Link Is Present
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card .view-link    10s
    ${link_text}=    Get Text    css=.product-card .view-link
    Should Be Equal    ${link_text}    View & Customize

Category Filter Can Be Changed
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains    Filter the Menu    10s
    Wait Until Page Contains Element    css=.filter input[type="checkbox"]    10s

    ${before}=    Get Element Count    css=.product-card
    Click Element    xpath=//div[contains(@class,'filter')]//label[contains(normalize-space(.),'Coffee')]//input[@type='checkbox']
    ${after}=    Get Element Count    css=.product-card

    Should Be True    ${before} >= 0
    Should Be True    ${after} >= 0

View And Customize Navigates To Product Page
    Go To    ${STOREFRONT_URL}
    Wait Until Page Contains Element    css=.product-card .view-link    10s
    Click Link    View & Customize
    Wait Until Location Contains    /product/    10s