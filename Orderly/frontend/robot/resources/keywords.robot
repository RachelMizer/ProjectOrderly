*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py

*** Keywords ***
Open Browser To App
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    10 seconds
    Set Selenium Speed    0.2 seconds

Close Browser Session
    Close Browser

Go To Login Page
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    id=email

Login As Test User
    Go To Login Page
    Input Text    id=email    ${TEST_EMAIL}
    Input Password    id=password    ${TEST_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login']
    Wait Until Page Contains    Home Page

Open Profile Page
    Click Link    Profile
    Wait Until Page Contains    My Profile

Fill Profile Form
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Input Text    id=lastName    ${UPDATED_LAST_NAME}
    Input Text    id=streetAddress    ${UPDATED_STREET}
    Input Text    id=city    ${UPDATED_CITY}
    Input Text    id=state    ${UPDATED_STATE}
    Input Text    id=zipcode    ${UPDATED_ZIP}
    Input Text    id=phone    ${UPDATED_PHONE}

Clear And Type
    [Arguments]    ${locator}    ${value}
    Click Element    ${locator}
    Press Keys    ${locator}    CTRL+a
    Press Keys    ${locator}    BACKSPACE
    Input Text    ${locator}    ${value}