*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py

*** Variables ***
${STORE_URL}          ${BASE_URL}
${LOGIN_URL}          ${BASE_URL}/login
${CUSTOMER_EMAIL}     customer1@example.com
${CUSTOMER_PASSWORD}  Password123!

*** Keywords ***
Open Browser And Login As Customer
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${LOGIN_URL}
    Wait Until Page Contains Element    xpath=//input[@type='email' or contains(@name,'email') or contains(@id,'email')]    15s
    Input Text    xpath=//input[@type='email' or contains(@name,'email') or contains(@id,'email')]    ${CUSTOMER_EMAIL}
    Input Password    xpath=//input[@type='password' or contains(@name,'password') or contains(@id,'password')]    ${CUSTOMER_PASSWORD}
    Click Element    xpath=//button[contains(normalize-space(.), 'Sign In') or contains(normalize-space(.), 'Login') or contains(normalize-space(.), 'Log In') or @type='submit']
    Wait Until Page Contains Element    xpath=//body    15s

Open Latte Page
    Go To    ${STORE_URL}
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Latte')]    15s
    Scroll Element Into View    xpath=//*[contains(normalize-space(.), 'Latte')]
    Click Element    xpath=//*[contains(normalize-space(.), 'Latte')]
    Wait Until Page Contains    Latte    15s

Open Breakfast Sandwich Page
    Go To    ${STORE_URL}
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Breakfast Sandwich')]    15s
    Scroll Element Into View    xpath=//*[contains(normalize-space(.), 'Breakfast Sandwich')]
    Click Element    xpath=//*[contains(normalize-space(.), 'Breakfast Sandwich')]
    Wait Until Page Contains    Breakfast Sandwich    15s

Price Should Change
    [Arguments]    ${before}
    ${after}=    Get Text    xpath=(//*[contains(text(), '$')])[last()]
    Should Not Be Equal    ${before}    ${after}

*** Test Cases ***
Customer Can Open Latte Customization Page
    Open Browser And Login As Customer
    Open Latte Page
    Page Should Contain    Latte
    Close Browser

Latte Customization Page Loads Successfully
    Open Browser And Login As Customer
    Open Latte Page
    Wait Until Page Contains    Latte    15s
    Close Browser

Customer Can Change Latte Variant
    Open Browser And Login As Customer
    Open Latte Page
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Medium')] | //*[contains(normalize-space(.), 'Large')]    15s
    Click Element    xpath=//*[contains(normalize-space(.), 'Medium')] | //*[contains(normalize-space(.), 'Large')]
    Close Browser

Changing Variant Reloads Options
    Open Browser And Login As Customer
    Open Latte Page
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Medium')] | //*[contains(normalize-space(.), 'Large')]    15s
    Click Element    xpath=//*[contains(normalize-space(.), 'Medium')] | //*[contains(normalize-space(.), 'Large')]
    Sleep    1s
    Page Should Contain    Latte
    Close Browser

Breakfast Sandwich Loads Modifier Options
    Open Browser And Login As Customer
    Open Breakfast Sandwich Page
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Croissant')]    15s
    Close Browser

Customer Can Select Breakfast Sandwich Bread Option
    Open Browser And Login As Customer
    Open Breakfast Sandwich Page
    Wait Until Page Contains Element    xpath=//*[contains(normalize-space(.), 'Croissant')]    15s
    Click Element    xpath=//*[contains(normalize-space(.), 'Croissant')]
    Close Browser

Customer Can Select Multiple Breakfast Sandwich Protein Options
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${BASE_URL}/product/10
    Wait Until Page Contains    Breakfast Sandwich    15s
    Wait Until Page Contains Element    xpath=//input[@type='checkbox']    15s

    Click Element    xpath=(//input[@type='checkbox'])[1]
    Click Element    xpath=(//input[@type='checkbox'])[2]

    Close Browser

Breakfast Sandwich Shows Required Modifier Options
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${BASE_URL}/product/10
    Wait Until Page Contains    Breakfast Sandwich    15s
    Wait Until Page Contains Element    xpath=//input[@type='radio']    15s

    ${radio_count}=    Get Element Count    xpath=//input[@type='radio']
    Should Be True    ${radio_count} > 0

    Close Browser

Breakfast Sandwich Modifier Selection Updates UI
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${BASE_URL}/product/10
    Wait Until Page Contains    Breakfast Sandwich    15s
    Wait Until Page Contains Element    xpath=//input[@type='radio']    15s
    Wait Until Page Contains Element    xpath=//input[@type='checkbox']    15s

    ${before}=    Get Text    xpath=(//*[contains(text(), '$')])[last()]

    Click Element    xpath=(//input[@type='radio'])[1]
    Click Element    xpath=(//input[@type='checkbox'])[1]

    Wait Until Keyword Succeeds    10s    1s    Price Should Change    ${before}

    Close Browser