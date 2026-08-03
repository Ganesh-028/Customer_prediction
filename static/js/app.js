/* ==========================================================================
   ChurnNexus Core Frontend Javascript Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Global Elements
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const notificationBtn = document.getElementById("notification-btn");
    const notificationPanel = document.getElementById("notification-panel");
    const clearNotificationsBtn = document.getElementById("clear-notifications");
    const notificationList = document.getElementById("notification-list");
    const notificationBadge = document.getElementById("notification-badge-count");
    const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    
    // Notifications State
    let notifications = [];

    // ==========================================================================
    // Theme Management (Light / Dark Mode Toggle)
    // ==========================================================================
    const currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const theme = document.documentElement.getAttribute("data-theme");
            const newTheme = theme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            showNotification(`Swapped to ${newTheme} mode`, "info");
        });
    }

    // Mobile Sidebar Toggle
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }

    // ==========================================================================
    // Notification Service
    // ==========================================================================
    function showNotification(message, type = "info") {
        // Create float alert toast
        const container = document.getElementById("alert-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `alert-toast alert-toast-${type}`;
        
        let icon = "fa-circle-info";
        if (type === "success") icon = "fa-circle-check";
        if (type === "error") icon = "fa-triangle-exclamation";

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <div class="alert-text">${message}</div>
            <button class="alert-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(toast);

        // Toast close action
        toast.querySelector(".alert-close").addEventListener("click", () => {
            toast.remove();
        });

        // Auto remove toast
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        // Push to notification drawer log
        addNotificationLog(message, type);
    }

    function addNotificationLog(message, type) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        notifications.unshift({ message, type, time });
        updateNotificationPanel();
    }

    function updateNotificationPanel() {
        if (!notificationList || !notificationBadge) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `<div class="empty-notification">No new notifications.</div>`;
            notificationBadge.style.display = "none";
            return;
        }

        notificationBadge.textContent = notifications.length;
        notificationBadge.style.display = "flex";

        notificationList.innerHTML = notifications.map(n => {
            let iconColor = "text-info";
            if (n.type === "success") iconColor = "text-green";
            if (n.type === "error") iconColor = "text-danger";

            return `
                <div class="notification-item">
                    <i class="fa-solid fa-circle-info n-icon ${iconColor}"></i>
                    <div class="n-content">
                        <p>${n.message}</p>
                        <span>${n.time}</span>
                    </div>
                </div>
            `;
        }).join("");
    }

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle("show");
        });

        document.addEventListener("click", () => {
            notificationPanel.classList.remove("show");
        });

        notificationPanel.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener("click", () => {
            notifications = [];
            updateNotificationPanel();
        });
    }

    // ==========================================================================
    // Loader Service
    // ==========================================================================
    function showLoader(title, desc) {
        const loader = document.getElementById("global-loader");
        const titleText = document.getElementById("loader-title-text");
        const descText = document.getElementById("loader-desc-text");
        const bar = document.getElementById("loader-progress-fill-bar");
        const pct = document.getElementById("loader-percent-val");

        if (loader) {
            if (titleText) titleText.textContent = title;
            if (descText) descText.textContent = desc;
            if (bar) bar.style.width = "0%";
            if (pct) pct.textContent = "0%";
            loader.style.display = "flex";
        }
    }

    function updateLoaderProgress(percent) {
        const bar = document.getElementById("loader-progress-fill-bar");
        const pct = document.getElementById("loader-percent-val");
        if (bar) bar.style.width = `${percent}%`;
        if (pct) pct.textContent = `${percent}%`;
    }

    function hideLoader() {
        const loader = document.getElementById("global-loader");
        if (loader) loader.style.display = "none";
    }

    // Simulate loader progress helper
    function animateLoader(startPercent, endPercent, durationMs, callback) {
        let current = startPercent;
        const steps = 20;
        const stepTime = durationMs / steps;
        const increment = (endPercent - startPercent) / steps;

        const interval = setInterval(() => {
            current += increment;
            if (current >= endPercent) {
                current = endPercent;
                clearInterval(interval);
                if (callback) callback();
            }
            updateLoaderProgress(Math.round(current));
        }, stepTime);
        return interval;
    }

    // ==========================================================================
    // Tab Controller
    // ==========================================================================
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            
            // Handle target panel ID matching
            let panelId = `panel-${targetTab}`;
            // Special mappings if needed
            if (targetTab === "profiling" || targetTab === "eda" || targetTab === "training") {
                panelId = `panel-${targetTab}`;
            }
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.add("active");
        });
    });

    // ==========================================================================
    // PAGE 1: Upload Dataset
    // ==========================================================================
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("file-input");
    const selectedFileBadge = document.getElementById("selected-file-badge");
    const selectedFileName = document.getElementById("selected-file-name");
    const uploadProgress = document.getElementById("upload-progress");
    const uploadProgressFill = document.getElementById("upload-progress-fill");
    const uploadPercent = document.getElementById("upload-percent");
    const uploadStatusText = document.getElementById("upload-status-text");
    
    const previewContainer = document.getElementById("dataset-preview-container");
    const rowsBadge = document.getElementById("rows-badge");
    const colsBadge = document.getElementById("cols-badge");
    const targetBadge = document.getElementById("target-badge");
    const previewThead = document.getElementById("preview-thead");
    const previewTbody = document.getElementById("preview-tbody");
    
    // Modal Select Target
    const targetModal = document.getElementById("target-modal");
    const targetSelect = document.getElementById("target-column-select");
    const confirmTargetBtn = document.getElementById("btn-confirm-target");
    const cancelTargetBtn = document.getElementById("btn-cancel-target");
    const closeTargetModal = document.getElementById("close-target-modal");

    if (dropzone && fileInput) {
        dropzone.addEventListener("click", () => fileInput.click());
        
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("drag-over");
        });
        
        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("drag-over");
        });
        
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleDatasetUpload(files[0]);
            }
        });
        
        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                handleDatasetUpload(e.target.files[0]);
            }
        });
    }

    function handleDatasetUpload(file) {
        if (!file.name.endsWith(".csv")) {
            showNotification("Please upload a CSV file format only.", "error");
            return;
        }

        // Show Progress Bar
        selectedFileName.textContent = file.name;
        selectedFileBadge.style.display = "inline-flex";
        uploadProgress.style.display = "block";
        uploadProgressFill.style.width = "0%";
        uploadPercent.textContent = "0%";
        uploadStatusText.textContent = "Uploading CSV dataset...";
        previewContainer.style.display = "none";

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload", true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                uploadProgressFill.style.width = `${percent}%`;
                uploadPercent.textContent = `${percent}%`;
                if (percent === 100) {
                    uploadStatusText.textContent = "Analyzing structure & generating preview...";
                }
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    showNotification("Dataset uploaded and structured successfully!", "success");
                    displayDatasetPreview(response.data);
                } else {
                    showNotification(response.error || "Failed to upload file.", "error");
                    uploadProgress.style.display = "none";
                }
            } else {
                showNotification("Server error uploading file.", "error");
                uploadProgress.style.display = "none";
            }
        };

        xhr.send(formData);
    }

    function displayDatasetPreview(data) {
        uploadProgress.style.display = "none";
        rowsBadge.textContent = `${data.shape[0]} Rows`;
        colsBadge.textContent = `${data.shape[1]} Columns`;
        
        if (data.target_detected) {
            targetBadge.textContent = `Target: ${data.detected_target}`;
            targetBadge.className = "badge badge-success";
        } else {
            targetBadge.textContent = "Target: Missing";
            targetBadge.className = "badge badge-danger";
            // Open selection modal
            openTargetSelectionModal(data.all_columns);
        }

        // Render Headers
        previewThead.innerHTML = `<tr>${data.columns.map(col => `<th>${col}</th>`).join("")}</tr>`;
        
        // Render Rows
        previewTbody.innerHTML = data.rows.map(row => {
            return `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`;
        }).join("");

        previewContainer.style.display = "block";
    }

    function openTargetSelectionModal(columns) {
        if (!targetModal || !targetSelect) return;
        targetSelect.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join("");
        targetModal.style.display = "flex";
    }

    if (confirmTargetBtn) {
        confirmTargetBtn.addEventListener("click", () => {
            const selectedCol = targetSelect.value;
            showLoader("Setting Target Column", `Mapping target label to: ${selectedCol}`);
            
            fetch("/select-target", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_col: selectedCol })
            })
            .then(res => res.json())
            .then(res => {
                hideLoader();
                if (res.success) {
                    targetModal.style.display = "none";
                    showNotification(`Target mapped to ${selectedCol}`, "success");
                    displayDatasetPreview(res.data);
                } else {
                    showNotification(res.error, "error");
                }
            })
            .catch(() => {
                hideLoader();
                showNotification("Network error mapping target.", "error");
            });
        });
    }

    if (cancelTargetBtn) cancelTargetBtn.addEventListener("click", () => targetModal.style.display = "none");
    if (closeTargetModal) closeTargetModal.addEventListener("click", () => targetModal.style.display = "none");


    // ==========================================================================
    // PAGE 2: Data Profiling & Interactive EDA
    // ==========================================================================
    const tabEdaTrigger = document.getElementById("tab-eda-trigger");
    const activeTargetBadge = document.getElementById("active-target-badge");
    
    // Check if we are on Dashboard page and dataset is loaded
    if (activeTargetBadge && document.getElementById("profile-total-records")) {
        loadDataProfilingAndStats();
    }

    function loadDataProfilingAndStats() {
        fetch("/analyze")
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                const data = res.data;
                
                // Set summary numbers
                document.getElementById("profile-total-records").textContent = data.rows.toLocaleString();
                document.getElementById("profile-total-columns").textContent = data.columns;
                
                // Count total missing values
                let missingTotal = 0;
                let metadataRows = "";
                
                for (const col in data.missing_values) {
                    const count = data.missing_values[col];
                    missingTotal += count;
                    
                    const type = data.data_types[col];
                    const warning = count > 0 ? `<span class="text-danger font-bold">${count}</span>` : count;
                    metadataRows += `<tr><td><b>${col}</b></td><td><code style='color:var(--secondary);'>${type}</code></td><td>${warning}</td></tr>`;
                }
                document.getElementById("profile-missing-count").textContent = missingTotal.toLocaleString();
                document.getElementById("profile-duplicate-count").textContent = data.duplicates;
                
                // Fill columns metadata table
                const metadataTbody = document.getElementById("metadata-tbody");
                if (metadataTbody) metadataTbody.innerHTML = metadataRows;
                
                // Fill numerical summary table
                const numSummaryTbody = document.getElementById("numerical-summary-tbody");
                if (numSummaryTbody && data.num_summary) {
                    let numRows = "";
                    const metrics = Object.keys(data.num_summary);
                    if (metrics.length > 0) {
                        // Gather subkeys like mean, std, min, 50%
                        const cols = Object.keys(data.num_summary[metrics[0]]);
                        
                        for (const col of Object.keys(data.num_summary)) {
                            const details = data.num_summary[col];
                            numRows += `
                                <tr>
                                    <td><b>${col}</b></td>
                                    <td>${typeof details.mean === 'number' ? details.mean.toFixed(2) : details.mean}</td>
                                    <td>${typeof details.min === 'number' ? details.min.toFixed(2) : details.min}</td>
                                    <td>${typeof details['50%'] === 'number' ? details['50%'].toFixed(2) : details['50%']}</td>
                                    <td>${typeof details.max === 'number' ? details.max.toFixed(2) : details.max}</td>
                                </tr>`;
                        }
                        numSummaryTbody.innerHTML = numRows;
                    }
                }
                
                // Cache graphs data to render when Tab 2 is clicked
                window.edaGraphsData = data;
                showNotification("Dataset profiled successfully.", "success");
            } else {
                showNotification(res.error, "error");
            }
        })
        .catch(err => {
            console.error(err);
            showNotification("Network error load profiling data.", "error");
        });
    }

    if (tabEdaTrigger) {
        tabEdaTrigger.addEventListener("click", () => {
            // Render Plotly graphs if data is cached
            if (window.edaGraphsData) {
                setTimeout(() => renderEdaGraphs(window.edaGraphsData), 100);
            }
        });
    }

    function renderEdaGraphs(data) {
        const theme = document.documentElement.getAttribute("data-theme");
        const fontColor = theme === "dark" ? "#94a3b8" : "#475569";
        const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        const plotBg = "rgba(0,0,0,0)";
        
        // 1. Churn Target Pie Chart
        const pieData = [{
            values: data.target_dist.values,
            labels: data.target_dist.labels,
            type: 'pie',
            hole: 0.4,
            marker: { colors: ['#10b981', '#ef4444'] }
        }];
        const pieLayout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans' },
            margin: { t: 30, b: 30, l: 30, r: 30 },
            legend: { orientation: 'h', x: 0.1, y: -0.1 }
        };
        Plotly.newPlot('chart-churn-dist', pieData, pieLayout, {responsive: true});

        // 2. Contract vs Churn Bar Chart
        if (data.categorical_plots.Contract) {
            const contractData = data.categorical_plots.Contract;
            const traceStay = {
                x: contractData.categories,
                y: contractData.churn_no,
                name: 'Stay',
                type: 'bar',
                marker: { color: '#10b981' }
            };
            const traceChurn = {
                x: contractData.categories,
                y: contractData.churn_yes,
                name: 'Churn',
                type: 'bar',
                marker: { color: '#ef4444' }
            };
            const contractLayout = {
                barmode: 'stack',
                paper_bgcolor: plotBg,
                plot_bgcolor: plotBg,
                font: { color: fontColor, family: 'Plus Jakarta Sans' },
                xaxis: { gridcolor: gridColor },
                yaxis: { gridcolor: gridColor },
                margin: { t: 30, b: 30, l: 40, r: 20 },
                legend: { orientation: 'h', x: 0.1, y: -0.2 }
            };
            Plotly.newPlot('chart-contract-churn', [traceStay, traceChurn], contractLayout, {responsive: true});
        }

        // 3. Tenure Histogram
        if (data.histograms.tenure) {
            const tStay = {
                x: data.histograms.tenure.stay,
                type: 'histogram',
                name: 'Stay',
                opacity: 0.7,
                marker: { color: '#10b981' }
            };
            const tChurn = {
                x: data.histograms.tenure.churn,
                type: 'histogram',
                name: 'Churn',
                opacity: 0.7,
                marker: { color: '#ef4444' }
            };
            const tenureLayout = {
                barmode: 'overlay',
                paper_bgcolor: plotBg,
                plot_bgcolor: plotBg,
                font: { color: fontColor, family: 'Plus Jakarta Sans' },
                xaxis: { title: 'Tenure (Months)', gridcolor: gridColor },
                yaxis: { title: 'Frequency', gridcolor: gridColor },
                margin: { t: 30, b: 40, l: 50, r: 20 },
                legend: { orientation: 'h', x: 0.1, y: -0.2 }
            };
            Plotly.newPlot('chart-tenure-dist', [tStay, tChurn], tenureLayout, {responsive: true});
        }

        // 4. Monthly Charges Histogram
        if (data.histograms.MonthlyCharges) {
            const mcStay = {
                x: data.histograms.MonthlyCharges.stay,
                type: 'histogram',
                name: 'Stay',
                opacity: 0.7,
                marker: { color: '#10b981' }
            };
            const mcChurn = {
                x: data.histograms.MonthlyCharges.churn,
                type: 'histogram',
                name: 'Churn',
                opacity: 0.7,
                marker: { color: '#ef4444' }
            };
            const chargesLayout = {
                barmode: 'overlay',
                paper_bgcolor: plotBg,
                plot_bgcolor: plotBg,
                font: { color: fontColor, family: 'Plus Jakarta Sans' },
                xaxis: { title: 'Monthly Charges ($)', gridcolor: gridColor },
                yaxis: { title: 'Frequency', gridcolor: gridColor },
                margin: { t: 30, b: 40, l: 50, r: 20 },
                legend: { orientation: 'h', x: 0.1, y: -0.2 }
            };
            Plotly.newPlot('chart-charges-dist', [mcStay, mcChurn], chargesLayout, {responsive: true});
        }

        // 5. Correlation Heatmap
        if (data.correlation_matrix) {
            const corr = data.correlation_matrix;
            const heatmapData = [{
                z: corr.z,
                x: corr.x,
                y: corr.y,
                type: 'heatmap',
                colorscale: [[0, '#3b82f6'], [0.5, '#f8fafc'], [1, '#ec4899']],
                zmin: -1,
                zmax: 1
            }];
            const heatmapLayout = {
                paper_bgcolor: plotBg,
                plot_bgcolor: plotBg,
                font: { color: fontColor, family: 'Plus Jakarta Sans', size: 10 },
                margin: { t: 30, b: 80, l: 100, r: 20 }
            };
            Plotly.newPlot('chart-correlation', heatmapData, heatmapLayout, {responsive: true});
        }
    }


    // ==========================================================================
    // PAGE 2: Machine Learning Model Training Pipeline
    // ==========================================================================
    const runTrainingBtn = document.getElementById("btn-run-training");
    const readyTrainCard = document.getElementById("ready-train-card");
    const trainingResultsArea = document.getElementById("training-results-area");

    if (runTrainingBtn) {
        runTrainingBtn.addEventListener("click", () => {
            showLoader("Running ML pipeline", "Cleaning data, imputing, scaling, splitting, and training 5 models...");
            
            // Animate progress up to 90%
            let progressInterval = animateLoader(0, 92, 5000);
            
            fetch("/train", { method: "POST" })
            .then(res => res.json())
            .then(res => {
                clearInterval(progressInterval);
                updateLoaderProgress(100);
                
                setTimeout(() => {
                    hideLoader();
                    if (res.success) {
                        showNotification("Machine learning models trained and evaluated successfully!", "success");
                        displayModelResults(res.data);
                    } else {
                        showNotification(res.error, "error");
                    }
                }, 500);
            })
            .catch(() => {
                clearInterval(progressInterval);
                hideLoader();
                showNotification("Network error executing model pipeline.", "error");
            });
        });
    }

    function displayModelResults(data) {
        readyTrainCard.style.display = "none";
        
        // Update Best Model Title Banner
        document.getElementById("best-model-name-text").textContent = `${data.best_model_name}`;
        
        // Leaderboard table population
        const tbody = document.getElementById("leaderboard-tbody");
        let leaderRows = "";
        
        for (const name in data.models_comparison) {
            const metrics = data.models_comparison[name];
            const isBest = name === data.best_model_name;
            const badge = isBest ? `<span class="badge badge-success">Best Model</span>` : `<span class="badge badge-info">Trained</span>`;
            const rowClass = isBest ? `style="background: rgba(16, 185, 129, 0.05); font-weight: 600;"` : "";
            
            leaderRows += `
                <tr ${rowClass}>
                    <td><b>${name}</b></td>
                    <td>${(metrics.Accuracy * 100).toFixed(2)}%</td>
                    <td>${(metrics.Precision * 100).toFixed(2)}%</td>
                    <td>${(metrics.Recall * 100).toFixed(2)}%</td>
                    <td>${(metrics["F1 Score"] * 100).toFixed(2)}%</td>
                    <td>${(metrics["ROC-AUC"] * 100).toFixed(2)}%</td>
                    <td>${badge}</td>
                </tr>
            `;
        }
        tbody.innerHTML = leaderRows;
        
        // Render ML Plots
        renderMlCharts(data);
        trainingResultsArea.style.display = "block";
    }

    function renderMlCharts(data) {
        const theme = document.documentElement.getAttribute("data-theme");
        const fontColor = theme === "dark" ? "#94a3b8" : "#475569";
        const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        const plotBg = "rgba(0,0,0,0)";
        
        // 1. ROC Curve Plotly Chart
        const rocTraces = [];
        const colorsList = ["#4f46e5", "#8b5cf6", "#ec4899", "#10b981", "#fbbf24"];
        let colorIdx = 0;
        
        for (const name in data.roc_curves) {
            const curve = data.roc_curves[name];
            rocTraces.push({
                x: curve.fpr,
                y: curve.tpr,
                mode: 'lines',
                name: `${name} (AUC = ${curve.auc.toFixed(3)})`,
                line: { color: colorsList[colorIdx++ % colorsList.length], width: 2 }
            });
        }
        // Add baseline diagonal
        rocTraces.push({
            x: [0, 1],
            y: [0, 1],
            mode: 'lines',
            name: 'Random Guess',
            line: { dash: 'dash', color: '#64748b', width: 1.5 }
        });
        const rocLayout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans', size: 11 },
            xaxis: { title: 'False Positive Rate', gridcolor: gridColor },
            yaxis: { title: 'True Positive Rate', gridcolor: gridColor },
            margin: { t: 20, b: 40, l: 45, r: 20 },
            legend: { orientation: 'h', x: 0, y: -0.2, font: { size: 9 } }
        };
        Plotly.newPlot('chart-roc-comparison', rocTraces, rocLayout, {responsive: true});

        // 2. Confusion Matrix Heatmap
        const cm = data.confusion_matrix;
        const cmData = [{
            z: cm.matrix,
            x: cm.labels,
            y: cm.labels,
            type: 'heatmap',
            colorscale: [[0, '#f8fafc'], [1, '#4f46e5']],
            showscale: false
        }];
        const cmLayout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans', size: 12 },
            xaxis: { title: 'Predicted Status' },
            yaxis: { title: 'Actual Status' },
            margin: { t: 30, b: 45, l: 55, r: 20 },
            annotations: []
        };
        // Add text values in boxes
        for (let i = 0; i < cm.matrix.length; i++) {
            for (let j = 0; j < cm.matrix[i].length; j++) {
                cmLayout.annotations.push({
                    x: cm.labels[j],
                    y: cm.labels[i],
                    text: cm.matrix[i][j].toString(),
                    font: { color: (i===0 && j===0) || (i===1 && j===1) && theme === 'dark' ? '#000000' : '#4f46e5', size: 14, bold: true },
                    showarrow: false
                });
            }
        }
        Plotly.newPlot('chart-confusion-matrix', cmData, cmLayout, {responsive: true});

        // 3. Feature Importance Horizontal Bar Chart
        const featImportances = data.feature_importance.slice(0, 15).reverse(); // Top 15 sorted ascending
        const featNames = featImportances.map(item => item.feature);
        const featValues = featImportances.map(item => item.importance);
        
        const featTrace = {
            y: featNames,
            x: featValues,
            type: 'bar',
            orientation: 'h',
            marker: { color: 'rgba(79, 70, 229, 0.7)', line: { color: '#4f46e5', width: 1.5 } }
        };
        const featLayout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans', size: 11 },
            xaxis: { title: 'Importance weight', gridcolor: gridColor },
            yaxis: { automargin: true },
            margin: { t: 20, b: 40, l: 120, r: 20 }
        };
        Plotly.newPlot('chart-feature-importance', [featTrace], featLayout, {responsive: true});
    }


    // ==========================================================================
    // PAGE 3: Single Customer manual form prediction
    // ==========================================================================
    const singlePredictForm = document.getElementById("single-predict-form");
    const singlePlaceholder = document.getElementById("single-result-placeholder");
    const singleResultCard = document.getElementById("single-result-card");

    if (singlePredictForm) {
        singlePredictForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showLoader("Running prediction", "Evaluating customer risk parameters...");
            
            const formData = new FormData(singlePredictForm);
            
            fetch("/predict-single", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(res => {
                hideLoader();
                if (res.success) {
                    showNotification("Risk assessment computed successfully!", "success");
                    displaySinglePrediction(res.data);
                } else {
                    showNotification(res.error, "error");
                }
            })
            .catch(() => {
                hideLoader();
                showNotification("Network error executing single prediction.", "error");
            });
        });
    }

    function displaySinglePrediction(data) {
        if (singlePlaceholder) singlePlaceholder.style.display = "none";
        
        const outcomeCard = document.getElementById("outcome-card-color");
        const outcomeBadge = document.getElementById("outcome-badge-text");
        const outcomeProbability = document.getElementById("outcome-probability-text");
        const outcomeDesc = document.getElementById("outcome-desc-text");
        
        // Outcome panel styling
        const isChurn = data.prediction === "Churn";
        if (isChurn) {
            outcomeCard.className = "outcome-card outcome-card-churn";
            outcomeBadge.textContent = "Churn Risk";
            outcomeProbability.textContent = `${data.confidence_percentage.toFixed(1)}% Churn Risk`;
            outcomeDesc.textContent = "This account exhibits behavior corresponding to customer churn models. Retention incentives are highly recommended.";
        } else {
            outcomeCard.className = "outcome-card outcome-card-stay";
            outcomeBadge.textContent = "Stay Predict";
            outcomeProbability.textContent = `${data.confidence_percentage.toFixed(1)}% Stay Score`;
            outcomeDesc.textContent = "This account appears highly stable and is classified as low churn risk. Standard engagement is sufficient.";
        }
        
        // Local Explainable AI Graph
        renderLocalXaiChart(data.explainability);
        
        // Insights and Recommendations
        const insightsList = document.getElementById("single-insights-list");
        const actionsList = document.getElementById("single-actions-list");
        
        if (insightsList) {
            insightsList.innerHTML = data.insights.map(ins => `<li>${ins}</li>`).join("");
        }
        
        if (actionsList) {
            actionsList.innerHTML = data.recommendations.map(act => `<li>${act}</li>`).join("");
        }
        
        if (singleResultCard) {
            singleResultCard.style.display = "flex";
            // Scroll to results on mobile
            if (window.innerWidth < 768) {
                singleResultCard.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    function renderLocalXaiChart(explainability) {
        // Reverse elements to align largest contributors at the top of horizontal chart
        const items = [...explainability].reverse();
        const featNames = items.map(item => item.feature);
        const contribs = items.map(item => item.contribution);
        
        // Color elements based on positive/negative contribution (red for Churn/Positive, green for Stay/Negative)
        const barColors = contribs.map(val => val > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)');
        const lineColors = contribs.map(val => val > 0 ? '#ef4444' : '#22c55e');

        const theme = document.documentElement.getAttribute("data-theme");
        const fontColor = theme === "dark" ? "#94a3b8" : "#475569";
        const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        const plotBg = "rgba(0,0,0,0)";

        const trace = {
            y: featNames,
            x: contribs,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: barColors,
                line: { color: lineColors, width: 1 }
            }
        };

        const layout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans', size: 10.5 },
            xaxis: { title: 'Contribution Weight (Stay ← 0 → Churn)', gridcolor: gridColor },
            yaxis: { automargin: true },
            margin: { t: 10, b: 35, l: 120, r: 20 }
        };

        Plotly.newPlot('chart-local-xai', [trace], layout, {responsive: true});
    }


    // ==========================================================================
    // PAGE 3: Batch CSV predictions list & Pagination/Search
    // ==========================================================================
    const batchDropzone = document.getElementById("batch-dropzone");
    const batchFileInput = document.getElementById("batch-file-input");
    const batchFileBadge = document.getElementById("batch-selected-file-badge");
    const batchFileName = document.getElementById("batch-selected-file-name");
    const runBatchBtn = document.getElementById("btn-run-batch");
    const batchResultsArea = document.getElementById("batch-results-area");
    
    // Global variable to keep records for client-side search/filter/paging
    window.batchPredictions = [];
    window.filteredPredictions = [];
    window.currentPage = 1;
    window.recordsPerPage = 10;
    window.currentSortCol = "probability";
    window.currentSortDirection = "desc";

    if (batchDropzone && batchFileInput) {
        batchDropzone.addEventListener("click", () => batchFileInput.click());
        
        batchDropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            batchDropzone.classList.add("drag-over");
        });
        
        batchDropzone.addEventListener("dragleave", () => {
            batchDropzone.classList.remove("drag-over");
        });
        
        batchDropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            batchDropzone.classList.remove("drag-over");
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                stageBatchFile(files[0]);
            }
        });
        
        batchFileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                stageBatchFile(e.target.files[0]);
            }
        });
    }

    function stageBatchFile(file) {
        if (!file.name.endsWith(".csv")) {
            showNotification("Please upload a CSV file format only.", "error");
            return;
        }
        batchFileName.textContent = file.name;
        batchFileBadge.style.display = "inline-flex";
        runBatchBtn.disabled = false;
        showNotification("Batch file staged. Click Execute to predict.", "info");
    }

    if (runBatchBtn) {
        runBatchBtn.addEventListener("click", () => {
            const file = batchFileInput.files[0] || (batchFileInput.files.length === 0 ? null : null);
            if (!file) {
                showNotification("No file selected.", "error");
                return;
            }
            
            showLoader("Running Batch predictions", "Applying preprocessors and scoring accounts...");
            let pInterval = animateLoader(0, 95, 4000);
            
            const formData = new FormData();
            formData.append("file", file);
            
            fetch("/predict-batch", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(res => {
                clearInterval(pInterval);
                updateLoaderProgress(100);
                
                setTimeout(() => {
                    hideLoader();
                    if (res.success) {
                        showNotification("Batch dataset scored successfully!", "success");
                        renderBatchDashboard(res);
                    } else {
                        showNotification(res.error, "error");
                    }
                }, 400);
            })
            .catch(() => {
                clearInterval(pInterval);
                hideLoader();
                showNotification("Network error executing batch prediction.", "error");
            });
        });
    }

    function renderBatchDashboard(res) {
        const summary = res.summary;
        
        // 1. Text Metrics
        document.getElementById("batch-total-customers").textContent = summary.total_customers.toLocaleString();
        document.getElementById("batch-churn-count").textContent = summary.churn_count.toLocaleString();
        document.getElementById("batch-churn-rate").textContent = `${summary.churn_rate.toFixed(1)}%`;
        document.getElementById("batch-avg-confidence").textContent = `${summary.avg_confidence.toFixed(1)}%`;
        
        // Batch AI Insights
        const insightsList = document.getElementById("batch-insights-list");
        if (insightsList && summary.insights) {
            insightsList.innerHTML = summary.insights.map(ins => `<li>${ins}</li>`).join("");
        }
        
        // 2. Risk Distribution Pie Chart
        renderBatchRiskChart(summary);
        
        // 2.5 Populate likely to leave list
        const likelyToLeaveTbody = document.getElementById("batch-likely-to-leave-tbody");
        if (likelyToLeaveTbody) {
            const churnPredictions = res.predictions
                .filter(p => p.prediction === "Churn")
                .sort((a, b) => b.probability - a.probability);
            
            if (churnPredictions.length === 0) {
                likelyToLeaveTbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No churn risks identified in this batch.</td></tr>`;
            } else {
                likelyToLeaveTbody.innerHTML = churnPredictions.map(p => `
                    <tr>
                        <td><b>${p.customerID}</b></td>
                        <td><span class="badge badge-danger">${(p.probability * 100).toFixed(1)}% Risk</span></td>
                        <td>${p.Contract}</td>
                    </tr>
                `).join("");
            }
        }
        
        // 3. Grid Table Details
        window.batchPredictions = res.predictions;
        window.filteredPredictions = [...res.predictions];
        window.currentPage = 1;
        
        // Perform initial sorting on probability descending
        sortPredictions("probability", "desc");
        
        batchResultsArea.style.display = "block";
        
        // Scroll to results
        batchResultsArea.scrollIntoView({ behavior: 'smooth' });
    }

    function renderBatchRiskChart(summary) {
        const theme = document.documentElement.getAttribute("data-theme");
        const fontColor = theme === "dark" ? "#94a3b8" : "#475569";
        const plotBg = "rgba(0,0,0,0)";
        
        const pieData = [{
            values: [summary.low_risk_count, summary.medium_risk_count, summary.high_risk_count],
            labels: ['Low Risk (<50%)', 'Medium Risk (50-80%)', 'High Risk (80%+)'],
            type: 'pie',
            hole: 0.35,
            marker: { colors: ['#22c55e', '#fbbf24', '#ef4444'] }
        }];
        const pieLayout = {
            paper_bgcolor: plotBg,
            plot_bgcolor: plotBg,
            font: { color: fontColor, family: 'Plus Jakarta Sans' },
            margin: { t: 30, b: 30, l: 30, r: 30 },
            legend: { orientation: 'h', x: 0.05, y: -0.1, font: { size: 9.5 } }
        };
        Plotly.newPlot('chart-batch-risk-dist', pieData, pieLayout, {responsive: true});
    }

    // Client-side search and filters handlers
    const tableSearchInput = document.getElementById("table-search-input");
    const filterPrediction = document.getElementById("table-filter-prediction");
    const filterRisk = document.getElementById("table-filter-risk");

    if (tableSearchInput) tableSearchInput.addEventListener("input", applyFilters);
    if (filterPrediction) filterPrediction.addEventListener("change", applyFilters);
    if (filterRisk) filterRisk.addEventListener("change", applyFilters);

    function applyFilters() {
        const query = tableSearchInput ? tableSearchInput.value.toLowerCase().trim() : "";
        const predVal = filterPrediction ? filterPrediction.value : "ALL";
        const riskVal = filterRisk ? filterRisk.value : "ALL";

        window.filteredPredictions = window.batchPredictions.filter(record => {
            const matchesSearch = record.customerID.toLowerCase().includes(query);
            const matchesPred = predVal === "ALL" || record.prediction === predVal;
            const matchesRisk = riskVal === "ALL" || record.risk_category === riskVal;
            
            return matchesSearch && matchesPred && matchesRisk;
        });

        window.currentPage = 1;
        renderPredictionsTable();
    }

    // Sorting columns helper
    const sortHeaders = document.querySelectorAll(".sort-header");
    sortHeaders.forEach(th => {
        th.addEventListener("click", () => {
            const colName = th.getAttribute("data-sort");
            const newDirection = (window.currentSortCol === colName && window.currentSortDirection === "asc") ? "desc" : "asc";
            
            sortPredictions(colName, newDirection);
        });
    });

    function sortPredictions(col, direction) {
        window.currentSortCol = col;
        window.currentSortDirection = direction;
        
        // Update headers sorting icons indicators
        sortHeaders.forEach(th => {
            const colName = th.getAttribute("data-sort");
            const icon = th.querySelector("i");
            if (colName === col) {
                th.style.fontWeight = "bold";
                if (direction === "asc") {
                    icon.className = "fa-solid fa-sort-up";
                } else {
                    icon.className = "fa-solid fa-sort-down";
                }
            } else {
                th.style.fontWeight = "normal";
                icon.className = "fa-solid fa-sort";
            }
        });

        window.filteredPredictions.sort((a, b) => {
            let valA = a[col];
            let valB = b[col];
            
            if (typeof valA === 'string') {
                return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
                return direction === "asc" ? valA - valB : valB - valA;
            }
        });

        window.currentPage = 1;
        renderPredictionsTable();
    }

    // Pagination Click triggers
    const pagPrevBtn = document.getElementById("pag-prev");
    const pagNextBtn = document.getElementById("pag-next");

    if (pagPrevBtn) {
        pagPrevBtn.addEventListener("click", () => {
            if (window.currentPage > 1) {
                window.currentPage--;
                renderPredictionsTable();
            }
        });
    }

    if (pagNextBtn) {
        pagNextBtn.addEventListener("click", () => {
            const maxPages = Math.ceil(window.filteredPredictions.length / window.recordsPerPage);
            if (window.currentPage < maxPages) {
                window.currentPage++;
                renderPredictionsTable();
            }
        });
    }

    function renderPredictionsTable() {
        const tbody = document.getElementById("predictions-results-tbody");
        if (!tbody) return;

        const total = window.filteredPredictions.length;
        document.getElementById("pag-total").textContent = total;

        if (total === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No matching predictions found.</td></tr>`;
            document.getElementById("pag-start").textContent = "0";
            document.getElementById("pag-end").textContent = "0";
            if (pagPrevBtn) pagPrevBtn.disabled = true;
            if (pagNextBtn) pagNextBtn.disabled = true;
            return;
        }

        const startIdx = (window.currentPage - 1) * window.recordsPerPage;
        const endIdx = Math.min(startIdx + window.recordsPerPage, total);
        
        document.getElementById("pag-start").textContent = startIdx + 1;
        document.getElementById("pag-end").textContent = endIdx;
        document.getElementById("pag-current").textContent = window.currentPage;
        
        if (pagPrevBtn) pagPrevBtn.disabled = window.currentPage === 1;
        if (pagNextBtn) pagNextBtn.disabled = endIdx >= total;

        const pageRecords = window.filteredPredictions.slice(startIdx, endIdx);
        
        tbody.innerHTML = pageRecords.map(row => {
            let predBadgeClass = row.prediction === "Churn" ? "badge-danger" : "badge-success";
            let riskBadgeClass = "badge-info";
            if (row.risk_category === "High Risk") riskBadgeClass = "badge-danger";
            if (row.risk_category === "Medium Risk") riskBadgeClass = "badge-purple";
            if (row.risk_category === "Low Risk") riskBadgeClass = "badge-success";
            
            return `
                <tr>
                    <td><b>${row.customerID}</b></td>
                    <td><span class="badge ${predBadgeClass}">${row.prediction}</span></td>
                    <td><b>${(row.probability * 100).toFixed(1)}%</b></td>
                    <td><span class="badge ${riskBadgeClass}">${row.risk_category}</span></td>
                    <td>${row.tenure} m</td>
                    <td>$${row.MonthlyCharges.toFixed(2)}</td>
                    <td>${row.Contract}</td>
                </tr>
            `;
        }).join("");
    }
});
