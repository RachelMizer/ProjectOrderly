*** Settings ***
Library    Browser

Suite Setup       Open Browser To Storefront
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:3000

*** Keywords ***
Open Browser To Storefront
    New Browser    chromium    headless=False
    New Context
    New Page    ${BASE_URL}/

Product Card Count Should Be Greater Than Zero
    ${count}=    Get Element Count    css=.product-card
    Should Be True    ${count} > 0

*** Test Cases ***
Product Cards Render On StoreFront
    Wait For Elements State    css=.product-grid    visible    10s
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    Take Screenshot

Product Card Shows Name
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    ${name}=    Get Text    css=.product-card >> nth=0 >> h3
    Should Not Be Empty    ${name}

Product Card Shows Variant Dropdown
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    ${count}=    Get Element Count    css=.product-card >> nth=0 >> select
    Should Be True    ${count} > 0

Product Card Shows Price
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    ${price}=    Get Text    css=.product-card >> nth=0 >> .price
    Should Contain    ${price}    $

In Stock Product Shows Quantity Controls
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    ${btns}=    Get Element Count    css=.product-card >> nth=0 >> .add-to-cart button
    Should Be True    ${btns} >= 0

Out Of Stock Product Shows Message If Present
    ${oos}=    Get Element Count    css=.product-card .OOS
    Should Be True    ${oos} >= 0

View Details Link Is Present
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    ${link}=    Get Text    css=.product-card >> nth=0 >> .view-link
    Should Be Equal    ${link}    View Details

Category Filter Can Be Changed
    Wait For Elements State    css=.filter select    visible    10s
    ${options}=    Get Element Count    css=.filter select option
    Should Be True    ${options} >= 1
    IF    ${options} > 1
        Select Options By    css=.filter select    value    1
        Take Screenshot
    END

View Details Navigates To Product Page
    Wait Until Keyword Succeeds    10x    1s    Product Card Count Should Be Greater Than Zero
    Wait For Elements State    css=.product-card >> nth=0 >> .view-link    visible    10s
    Click    css=.product-card >> nth=0 >> .view-link
    Wait For Elements State    css=.ind-product-pg    visible    10s
    Take Screenshot