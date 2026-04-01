*** Settings ***
Documentation     US3.7.1 - Modifier Selection Before Add To Cart
...               Covers pre-cart customization behavior only:
...               exact product navigation, variant selection, modifier rendering,
...               radio/checkbox selection behavior, price updates, and required group display.
Library           Browser

Suite Setup       Open Browser To Storefront
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}                    http://localhost:3000
${STORE_GRID}                  css=.product-grid
${PRODUCT_PAGE_ROOT}           css=.ind-product-pg
${PRODUCT_CARD}                css=.product-card
${PRICE_TEXT}                  css=.price
${VARIANT_RADIOS}              css=.variant-section input[type="radio"]
${MODIFIER_GROUP}              css=.modifier-group
${MODIFIER_OPTION}             css=.modifier-option
${MODIFIER_RADIOS}             css=.modifier-group input[type="radio"]
${MODIFIER_CHECKBOXES}         css=.modifier-group input[type="checkbox"]
${LATTE_PRODUCT}               Latte
${BREAKFAST_PRODUCT}           Breakfast Sandwich
${HEADLESS}                    True

*** Keywords ***
Open Browser To Storefront
    New Browser    chromium    headless=${HEADLESS}
    New Context
    New Page    ${BASE_URL}
    Wait For Elements State    ${STORE_GRID}    visible    15s
    Wait Until Keyword Succeeds    10x    1s    Storefront Should Have Product Cards

Storefront Should Have Product Cards
    ${count}=    Get Element Count    ${PRODUCT_CARD}
    Should Be True    ${count} > 0

Open Product By Exact Name
    [Arguments]    ${product_name}
    Go To    ${BASE_URL}
    Wait For Elements State    ${STORE_GRID}    visible    15s
    Wait Until Keyword Succeeds    10x    1s    Storefront Should Have Product Cards

    ${count}=    Get Element Count    ${PRODUCT_CARD}

    FOR    ${i}    IN RANGE    ${count}
        ${name}=    Get Text    css=.product-card >> nth=${i} >> h3
        ${name}=    Evaluate    """${name}""".strip()

        IF    "${name}" == "${product_name}"
            Click    css=.product-card >> nth=${i} >> .view-link
            Wait For Elements State    ${PRODUCT_PAGE_ROOT}    visible    10s
            RETURN
        END
    END

    Fail    Product "${product_name}" not found on storefront.

Wait For Modifiers
    ${loading_visible}=    Run Keyword And Return Status
    ...    Wait For Elements State    text=Loading options…    visible    2s
    IF    ${loading_visible}
        Wait For Elements State    text=Loading options…    hidden    10s
    END
    Wait For Elements State    ${PRODUCT_PAGE_ROOT}    visible    10s

Get Price Text
    ${price}=    Get Text    ${PRICE_TEXT}
    ${price}=    Evaluate    """${price}""".strip()
    RETURN    ${price}

Modifier Groups Should Exist
    ${count}=    Get Element Count    ${MODIFIER_GROUP}
    Should Be True    ${count} > 0

Select First Radio Option
    Wait For Elements State    css=.modifier-group input[type="radio"] >> nth=0    visible    10s
    Click    css=.modifier-group input[type="radio"] >> nth=0

Select Second Radio Option
    Wait For Elements State    css=.modifier-group input[type="radio"] >> nth=1    visible    10s
    Click    css=.modifier-group input[type="radio"] >> nth=1

Select First Checkbox Option
    Wait For Elements State    css=.modifier-group input[type="checkbox"] >> nth=0    visible    10s
    Click    css=.modifier-group input[type="checkbox"] >> nth=0

Select Second Checkbox Option
    Wait For Elements State    css=.modifier-group input[type="checkbox"] >> nth=1    visible    10s
    Click    css=.modifier-group input[type="checkbox"] >> nth=1

First Radio Should Be Checked
    ${checked}=    Get Property    css=.modifier-group input[type="radio"] >> nth=0    checked
    Should Be Equal    ${checked}    ${True}

Second Radio Should Be Checked
    ${checked}=    Get Property    css=.modifier-group input[type="radio"] >> nth=1    checked
    Should Be Equal    ${checked}    ${True}

First Radio Should Not Be Checked
    ${checked}=    Get Property    css=.modifier-group input[type="radio"] >> nth=0    checked
    Should Not Be Equal    ${checked}    ${True}

First Checkbox Should Be Checked
    ${checked}=    Get Property    css=.modifier-group input[type="checkbox"] >> nth=0    checked
    Should Be Equal    ${checked}    ${True}

Second Checkbox Should Be Checked
    ${checked}=    Get Property    css=.modifier-group input[type="checkbox"] >> nth=1    checked
    Should Be Equal    ${checked}    ${True}

At Least One Disabled Checkbox Should Exist
    ${count}=    Get Element Count    xpath=//input[@type="checkbox" and @disabled]
    Should Be True    ${count} > 0

Variant Radios Should Exist
    ${count}=    Get Element Count    ${VARIANT_RADIOS}
    Should Be True    ${count} > 0

*** Test Cases ***
Customer Can Open Latte Customization Page
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    ${title}=    Get Text    css=.ind-product-pg h1
    ${title}=    Evaluate    """${title}""".strip()
    Should Be Equal    ${title}    ${LATTE_PRODUCT}
    ${price}=    Get Text    ${PRICE_TEXT}
    Should Not Be Empty    ${price}

Latte Loads Modifier Groups
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    Modifier Groups Should Exist
    ${option_count}=    Get Element Count    ${MODIFIER_OPTION}
    Should Be True    ${option_count} > 0

Customer Can Select Milk Type Radio Option
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    ${radio_count}=    Get Element Count    ${MODIFIER_RADIOS}
    Should Be True    ${radio_count} > 0
    Select First Radio Option
    First Radio Should Be Checked

Selecting Another Radio Option Replaces Previous
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    ${radio_count}=    Get Element Count    ${MODIFIER_RADIOS}
    Should Be True    ${radio_count} > 1
    Select First Radio Option
    Select Second Radio Option
    Second Radio Should Be Checked
    First Radio Should Not Be Checked

Customer Can Select Multiple Modifier Options In A Multi Select Group
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    ${checkbox_count}=    Get Element Count    ${MODIFIER_CHECKBOXES}
    Should Be True    ${checkbox_count} > 1
    Select First Checkbox Option
    Select Second Checkbox Option
    First Checkbox Should Be Checked
    Second Checkbox Should Be Checked

Customer Cannot Exceed Max Modifier Selections In The UI
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers

    Click    text=Vanilla
    Click    text=Caramel

    ${mocha_disabled}=    Get Property    xpath=//label[contains(normalize-space(.),"Mocha")]/input    disabled
    Should Be Equal    ${mocha_disabled}    ${True}

    ${checked_count}=    Get Element Count    css=input[type="checkbox"]:checked
    Should Be Equal As Integers    ${checked_count}    2

Selecting Modifiers Updates The Live Total Price
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    ${before}=    Get Price Text
    ${checkbox_count}=    Get Element Count    ${MODIFIER_CHECKBOXES}
    IF    ${checkbox_count} > 0
        Select First Checkbox Option
    ELSE
        Select First Radio Option
    END
    ${after}=    Get Price Text
    Should Not Be Equal    ${before}    ${after}

Changing Variant Reloads Modifier Options
    Open Product By Exact Name    ${LATTE_PRODUCT}
    Wait For Modifiers
    Variant Radios Should Exist
    ${variant_count}=    Get Element Count    ${VARIANT_RADIOS}
    Should Be True    ${variant_count} > 1
    Click    css=.variant-section input[type="radio"] >> nth=1
    Wait For Modifiers
    ${after_group_count}=    Get Element Count    ${MODIFIER_GROUP}
    Should Be True    ${after_group_count} > 0

Breakfast Sandwich Shows Required Modifier Group
    Open Product By Exact Name    ${BREAKFAST_PRODUCT}
    Wait For Modifiers
    ${group_label_count}=    Get Element Count    xpath=//*[contains(normalize-space(.),"Bread Choice")]
    Should Be True    ${group_label_count} > 0