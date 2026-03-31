/*
exportCSV(checkedReqs, results, risks, vendors)
    Builds a CSV string. One row per requirement.
    Columns: req_id, category, text, rfp_page,
    then {vendor}_status + {vendor}_confidence per vendor.
    Risk summary appended as trailing rows.
    Triggers download via <a download> click.
exportPDF(checkedReqs, results, risks, vendors)
    Lazy-loads jsPDF from CDN on first call.
    Renders summary table + requirement breakdown.
    Triggers download.
*/