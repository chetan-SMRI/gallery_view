frappe.call({
    method: 'frappe.client.get',
    args: {
        doctype: 'Gallery View Settings',
        name: 'Gallery View Settings'
    },
    callback: function (res) {
        if (!res.message) return;

        const doctypes = res.message.doctypes || [];

        doctypes.forEach(row => {
            if (!row.linked_doctype) return;
            frappe.ui.form.on(row.linked_doctype, {
                onload(frm) {
                    if (frm.fields_dict.custom_gallery_view) {
                        render_gallery(frm);
                    } else {
                        console.log(`Custom Gallery View(custom_gallery_view) field not found in doctype(${row.linked_doctype}).`);
                    }
                },
                refresh(frm) {
                    if (frm.fields_dict.custom_gallery_view) {
                        render_gallery(frm);
                    } else {
                        console.log('Custom Gallery View field not found in doctype.');
                    }
                }
            });
        });
    }
});

function render_gallery(frm) {
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'File',
            filters: {
                attached_to_doctype: frm.doctype,
                attached_to_name: frm.docname,
                is_folder: 0
            },
            fields: ['file_url', 'file_name']
        },
        callback: function (r) {
            if (r.message) {
                const files = r.message;

                let html = `<div style="display: flex; flex-wrap: wrap; gap: 12px;">`;

                files.forEach((file, index) => {
                    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.file_url)) {
                        html += `
                            <a href="${file.file_url}" target="_blank" style="text-decoration: none;">
                                <div style="width: 190px; height: 190px; overflow: hidden; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <img src="${file.file_url}" alt="${file.file_name}"
                                        style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                                </div>
                            </a>`;
                    }
                });

                html += `</div>`;

                frm.set_df_property('custom_gallery_view', 'options', html);
                frm.refresh_field('custom_gallery_view');
            }
        }
    });
}
