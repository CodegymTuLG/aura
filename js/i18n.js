/**
 * i18n.js - Internationalization
 * Handles language switching and translation for the application.
 * Note: This file must be loaded with `defer` in the <head> tag.
 */
'use strict';

const translations = {
    vi: {
        // Common Header
        'go-to-hq-screen': 'Về màn hình HQ',
        'hq-system': 'HỆ THỐNG HQ',
        'go-to-store-screen': 'Về màn hình Store',
        'hq-tasks': 'Tasks HQ',
        'view-task-list': 'Danh sách Task',
        'create-new-task': 'Giao Task mới',
        'manage-stores': 'Quản lý Cửa hàng',
        'view-reports': 'Xem Báo cáo',
        'reports': 'Báo cáo',

        // index.html (Stores Tasks)
        'filter-by-store': 'Lọc theo cửa hàng',
        'all-stores': 'Tất cả cửa hàng',

        'stores-tasks': 'TASKS CỬA HÀNG',

        // hq-report.html
        'completion-rate-by-store': 'Tỷ lệ hoàn thành theo cửa hàng',
        'all-quarters': 'Tất cả các Quý',
        'quarter-1': 'Quý 1',
        'quarter-2': 'Quý 2',
        'quarter-3': 'Quý 3',
        'quarter-4': 'Quý 4',
        'all-months': 'Tất cả các Tháng',
        'month-1': 'Tháng 1', 'month-2': 'Tháng 2', 'month-3': 'Tháng 3',
        'month-4': 'Tháng 4', 'month-5': 'Tháng 5', 'month-6': 'Tháng 6',
        'month-7': 'Tháng 7', 'month-8': 'Tháng 8', 'month-9': 'Tháng 9',
        'month-10': 'Tháng 10', 'month-11': 'Tháng 11', 'month-12': 'Tháng 12',
        'store': 'Cửa hàng',
        'average': 'Trung bình',
        'task-stats-by-dept': 'Thống kê Task theo phòng ban',
        'department': 'Phòng ban',
        'planned': 'Kế hoạch',
        'unplanned': 'Ngoài KH',
        'total-tasks': 'Tổng Tasks',
        'planned-percent': '% Kế hoạch',
        'unplanned-percent': '% Ngoài KH',
        'loading-data': 'Đang tải dữ liệu...',

        // hq-task-list.html
        'show-progress-chart': 'Hiện biểu đồ tiến độ',
        'show-weekly-stats-chart': 'Hiện biểu đồ thống kê theo tuần',
        'this-week': 'Tuần này',
        'search-by-task-name': 'Tìm theo tên Task...',
        'week': 'Tuần',
        'responsible': 'Phụ trách',
        'task': 'Task',
        'progress': 'Tiến độ',
        'stores-unable': 'CH không thể',
        'status': 'Trạng thái',

        // hq-create-task.html
        'assign-new-task': 'Giao Task mới',
        'is-repeat': 'Lặp lại:',
        'date-range': 'Phạm vi Ngày',
        'yes': 'Có',
        'no': 'Không',
        'start': 'Bắt đầu',
        'end': 'Kết thúc',
        'keyword': 'Từ khóa',
        'enter-keyword': 'Nhập từ khóa',
        'manual': 'Hướng dẫn',
        'paste-link-here': 'Dán link vào đây',
        'store-selection': 'Chọn Cửa hàng',
        'search-by-store-name': 'Tìm theo Tên Cửa hàng',
        'search-by-region': 'Tìm theo Khu vực',
        'check-selected': 'Kiểm tra đã chọn',
        'add-to-task': 'Thêm vào Task',
        'selected-stores': 'Các cửa hàng đã chọn',
        'store-code': 'Mã CH',
        'store-name': 'Tên CH',
        'region': 'Khu vực',
        'task-details': 'Chi tiết Task',
        're-h': 'RE(h)',
        'task-name': 'Tên Task',
        'task-type': 'Loại Task',
        'enter-task-name-placeholder': 'Nhập tên task',
        'response-type': 'Loại Phản hồi',
        'task-details-for-store': 'Chi tiết Task cho Cửa hàng:',
        'write-request-for-store': 'Viết yêu cầu cho cửa hàng',
        'add-as-repeat-task': 'Thêm Task Lặp lại',
        'create-task': 'Tạo Task',
        'fill-required-fields-alert': 'Vui lòng điền vào các trường bắt buộc sau:',
        'task-type-stats': 'Thống kê',
        'task-type-sort': 'Sắp xếp',
        'task-type-prepare': 'Chuẩn bị',
        'response-type-picture': 'Picture',
        'response-type-checklist': 'Check-List',
        'response-type-yesno': 'Yes-No',

        'end-date-before-start-alert': 'Ngày kết thúc không thể trước ngày bắt đầu.',
        'popup-confirm-title': 'Xác nhận Tạo Task',
        'popup-confirm-message': 'Vui lòng xem lại các chi tiết bên dưới trước khi tạo task.',
        'popup-task-name': 'Tên Task',
        'popup-keyword': 'Từ khóa',
        'popup-is-repeat': 'Lặp lại',
        'popup-dates': 'Ngày',
        'popup-re-h': 'RE(h)',
        'popup-task-type': 'Loại Task',
        'popup-response-type': 'Loại Phản hồi',
        'popup-stores': 'Cửa hàng',
        'popup-manual-link': 'Link Hướng dẫn',
        'popup-task-details': 'Chi tiết Task',
        'popup-cancel-btn': 'Hủy',
        'popup-confirm-btn': 'Xác nhận & Tạo',

        // hq-store.html
        'filter-by-dept': 'Lọc theo phòng ban',
        'all-depts': 'Tất cả phòng ban',
        'filter-by-staff': 'Lọc theo nhân viên',
        'toggle-week-view-title': 'Bấm để xem ALL ngày của tuần',

        // Detailtask.html
        'back-to-list': 'Trở về danh sách',
        'task-name-placeholder': 'Trưng bày Bánh Trung Thu',
        'task-meta-placeholder': 'RE 30 phút • 29 Th06 – 04 Th07',
        'teachme-link': '📘 Teachme:',
        'file-link': '📎 Tệp:',
        'comment-placeholder': 'Viết nhận xét ở đây...',
        'all-staff': 'Tất cả nhân viên',

        // hq-store-detail.html
        'store-details-title': 'Chi tiết Cửa hàng',
        'export-csv': 'Xuất CSV',
        'no-short': 'STT',
        'actual-start': 'Bắt đầu thực tế',
        'actual-end': 'Kết thúc thực tế',
        'page-of': 'trang', // for pagination, e.g. 2/51

    },
    en: {
        // Common Header
        'go-to-hq-screen': 'Go to HQ screen',
        'hq-system': 'HQ SYSTEM',
        'go-to-store-screen': 'Go to Store screen',
        'hq-tasks': 'HQ Tasks',
        'view-task-list': 'Task List',
        'create-new-task': 'Create New Task',
        'manage-stores': 'Manage Stores',
        'view-reports': 'View Reports',
        'reports': 'Reports',

        // index.html (Stores Tasks)
        'filter-by-store': 'Filter by store',
        'all-stores': 'All stores',

        'stores-tasks': 'STORES TASKS',

        // hq-report.html
        'completion-rate-by-store': 'Completion Rate by Store',
        'all-quarters': 'All Quarters',
        'quarter-1': 'Quarter 1',
        'quarter-2': 'Quarter 2',
        'quarter-3': 'Quarter 3',
        'quarter-4': 'Quarter 4',
        'all-months': 'All Months',
        'month-1': 'Month 1', 'month-2': 'Month 2', 'month-3': 'Month 3',
        'month-4': 'Month 4', 'month-5': 'Month 5', 'month-6': 'Month 6',
        'month-7': 'Month 7', 'month-8': 'Month 8', 'month-9': 'Month 9',
        'month-10': 'Month 10', 'month-11': 'Month 11', 'month-12': 'Month 12',
        'store': 'Store',
        'average': 'Average',
        'task-stats-by-dept': 'Task Stats by Department',
        'department': 'Department',
        'planned': 'Planned',
        'unplanned': 'Unplanned',
        'total-tasks': 'Total Tasks',
        'planned-percent': '% Planned',
        'unplanned-percent': '% Unplanned',
        'loading-data': 'Loading data...',

        // hq-task-list.html
        'show-progress-chart': 'Show Progress Chart',
        'show-weekly-stats-chart': 'Show Weekly Stats Chart',
        'this-week': 'This Week',
        'search-by-task-name': 'Search by Task Name...',
        'week': 'Week',
        'responsible': 'Responsible',
        'task': 'Task',
        'progress': 'Progress',
        'stores-unable': 'Stores Unable',
        'status': 'Status',

        // hq-create-task.html
        'assign-new-task': 'Assign New Task',
        'is-repeat': 'Is Repeat:',
        'date-range': 'Date Range',
        'yes': 'Yes',
        'no': 'No',
        'start': 'Start',
        'end': 'End',
        'keyword': 'Keyword',
        'enter-keyword': 'Enter keyword',
        'manual': 'Manual',
        'paste-link-here': 'Paste link here',
        'store-selection': 'Store Selection',
        'search-by-store-name': 'Search by Store Name',
        'search-by-region': 'Search by Region',
        'check-selected': 'Check Selected',
        'add-to-task': 'Add to Task',
        'selected-stores': 'Selected Stores',
        'store-code': 'Store Code',
        'store-name': 'Store Name',
        'region': 'Region',
        'task-details': 'Task Details',
        're-h': 'RE(h)',
        'task-name': 'Task Name',
        'task-type': 'Task Type',
        'enter-task-name-placeholder': 'Enter task name',
        'response-type': 'Response Type',
        'task-details-for-store': 'Task Details for Store:',
        'write-request-for-store': 'Write request for store',
        'add-as-repeat-task': 'Add as Repeat Task',
        'create-task': 'Create Task',
        'fill-required-fields-alert': 'Please fill in the following required fields:',
        'task-type-stats': 'Statistics',
        'task-type-sort': 'Sorting',
        'task-type-prepare': 'Preparation',
        'response-type-picture': 'Picture',
        'response-type-checklist': 'Check-List',
        'response-type-yesno': 'Yes-No',

        'end-date-before-start-alert': 'End date cannot be before the start date.',
        'popup-confirm-title': 'Confirm Task Creation',
        'popup-confirm-message': 'Please review the details below before creating the task.',
        'popup-task-name': 'Task Name',
        'popup-keyword': 'Keyword',
        'popup-is-repeat': 'Is Repeat',
        'popup-dates': 'Dates',
        'popup-re-h': 'RE(h)',
        'popup-task-type': 'Task Type',
        'popup-response-type': 'Response Type',
        'popup-stores': 'Stores',
        'popup-manual-link': 'Manual Link',
        'popup-task-details': 'Task Details',
        'popup-cancel-btn': 'Cancel',
        'popup-confirm-btn': 'Confirm & Create',

        // hq-store.html
        'filter-by-dept': 'Filter by department',
        'all-depts': 'All departments',
        'filter-by-staff': 'Filter by staff',
        'toggle-week-view-title': 'Click to view ALL days of the week',

        // Detailtask.html
        'back-to-list': 'Back to List',
        'task-name-placeholder': 'Display Full Moon Flower',
        'task-meta-placeholder': 'RE 30 min • 29 Jun – 04 Jul',
        'teachme-link': '📘 Teachme:',
        'file-link': '📎 File:',
        'comment-placeholder': 'Write comments here...',
        'all-staff': 'All staff',

        // hq-store-detail.html
        'store-details-title': 'Store Details',
        'export-csv': 'Export CSV',
        'no-short': 'No.',
        'actual-start': 'Actual Start',
        'actual-end': 'Actual End',
        'page-of': 'of', // for pagination, e.g. 2 of 51
    }
};

function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    applyTranslations();
    // Gửi sự kiện để các module khác có thể lắng nghe và cập nhật
    document.dispatchEvent(new CustomEvent('languageChanged'));
}

function translate(key) {
    const lang = getCurrentLanguage();
    return translations[lang][key] || key;
}

function applyTranslations(element = document) {
    const lang = getCurrentLanguage();
    element.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        const translation = translate(key);

        // Check if the element is an input/textarea to set placeholder
        if (['INPUT', 'TEXTAREA'].includes(el.tagName) && (el.placeholder || el.type !== 'submit')) {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });

    // Cập nhật nút chuyển đổi ngôn ngữ
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.textContent = lang === 'vi' ? 'EN' : 'VI';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.createElement('button');
    langToggle.id = 'lang-toggle';
    langToggle.className = 'lang-toggle';
    langToggle.addEventListener('click', () => setLanguage(getCurrentLanguage() === 'vi' ? 'en' : 'vi'));
    
    // Thêm nút vào thanh header
    const homeScreen = document.querySelector('.home-screen');
    if (homeScreen) homeScreen.appendChild(langToggle);

    applyTranslations();
});