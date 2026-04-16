*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${ADMIN_REPORTS_URL}            ${BASE_URL}/admin/reports
${ADMIN_SALES_DASHBOARD_URL}    ${BASE_URL}/admin/reports/sales

*** Test Cases ***
Business Admin Can Open Sales Dashboard
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_SALES_DASHBOARD_URL}

    Wait Until Page Contains    Sales Summary    15s
    Wait Until Page Contains    Total Revenue    15s
    Wait Until Page Contains    Units Sold    15s
    Wait Until Page Contains    Sales by Product    15s
    Wait Until Page Contains    Revenue by    15s
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search product or variant...']    15s
    Wait Until Element Is Visible    xpath=(//select[contains(@class,'rpt-month-select')])[1]    15s
    Wait Until Element Is Visible    xpath=(//select[contains(@class,'rpt-month-select')])[2]    15s
    Wait Until Page Contains    EXPORT    15s
    Wait Until Page Contains    PRINT    15s
    Capture Page Screenshot
    Close Browser

Sales Dashboard Shows Top Seller And Product Table
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_SALES_DASHBOARD_URL}

    Wait Until Page Contains    Sales Summary    15s
    Wait Until Page Contains    Top Selling Product for    15s
    Wait Until Page Contains    Total Sales: $    15s
    Wait Until Page Contains    Units Sold:    15s
    Wait Until Element Is Visible    xpath=//table[contains(@class,'admin-table')]    15s
    Wait Until Page Contains Element    xpath=//th[contains(normalize-space(.), 'Product')]    15s
    Wait Until Page Contains Element    xpath=//th[contains(normalize-space(.), 'Variant')]    15s
    Wait Until Page Contains Element    xpath=//th[contains(normalize-space(.), 'Unit Price')]    15s
    Wait Until Page Contains Element    xpath=//th[contains(normalize-space(.), 'Units Sold')]    15s
    Wait Until Page Contains Element    xpath=//th[contains(normalize-space(.), 'Total Revenue')]    15s
    Wait Until Page Contains Element    xpath=//tbody/tr    15s
    Capture Page Screenshot
    Close Browser

Sales Dashboard Filters Can Change Month
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_SALES_DASHBOARD_URL}

    Wait Until Page Contains    Sales Summary    15s
    Wait Until Element Is Visible    xpath=(//select[contains(@class,'rpt-month-select')])[2]    15s
    Select From List By Label    xpath=(//select[contains(@class,'rpt-month-select')])[2]    April 2026
    Wait Until Page Contains    April 2026    15s
    Wait Until Page Contains    Top Selling Product for April 2026    15s
    Wait Until Page Contains    Revenue by    15s
    Capture Page Screenshot
    Close Browser

Sales Dashboard Search Filters Product Table
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_SALES_DASHBOARD_URL}

    Wait Until Page Contains    Sales by Product    15s
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search product or variant...']    15s
    Input Text    xpath=//input[@placeholder='Search product or variant...']    Latte
    Wait Until Page Contains Element    xpath=//tbody/tr/td[contains(normalize-space(.), 'Latte')]    15s
    Capture Page Screenshot
    Clear Element Text    xpath=//input[@placeholder='Search product or variant...']
    Input Text    xpath=//input[@placeholder='Search product or variant...']    zzz-no-match
    Wait Until Page Contains    No results match your search.    15s
    Capture Page Screenshot
    Close Browser

Business Admin Can Reach Sales Dashboard From Reports Hub
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_REPORTS_URL}

    Wait Until Page Contains    Generate a Report    15s
    Click Link    Sales Summary
    Wait Until Page Contains    Sales Summary    15s
    Wait Until Page Contains    Total Revenue    15s
    Wait Until Page Contains    Sales by Product    15s
    Capture Page Screenshot
    Close Browser

Customer Cannot Access Sales Dashboard
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Customer User
    Go To    ${ADMIN_SALES_DASHBOARD_URL}

    Wait Until Page Contains    Orderly    15s
    Wait Until Page Contains    Sign In    15s
    Page Should Not Contain    Sales Summary
    Page Should Not Contain    Total Revenue
    Capture Page Screenshot
    Close Browser