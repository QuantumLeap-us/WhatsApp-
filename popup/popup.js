// 添加全局错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('错误: ', msg, '\n文件: ', url, '\n行号: ', lineNo, '\n列号: ', columnNo, '\n错误对象: ', error);
    return false;
};

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成");
    
    try {
        // 获取按钮元素
        const scrapingBtn = document.getElementById("scraping-btn");
        
        if (!scrapingBtn) {
            console.error("未找到抓取按钮元素 (id: scraping-btn)");
            return;
        }
        
        console.log("找到抓取按钮元素:", scrapingBtn);
        
        // 添加点击事件监听器
        scrapingBtn.addEventListener("click", async function () {
            console.log("抓取按钮被点击");
            
            try {
                // 检查当前URL是否是WhatsApp Web
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (!tabs || !tabs[0] || !tabs[0].id) {
                    console.error("未找到活动标签页");
                    alert("未找到活动标签页");
                    return;
                }
                
                const tab = tabs[0];
                console.log("当前标签页:", tab);
                
                if (!tab.url || !tab.url.includes("web.whatsapp.com")) {
                    console.error("请在WhatsApp Web页面使用此扩展");
                    alert("请在WhatsApp Web页面使用此扩展");
                    return;
                }
                
                console.log("发送消息到标签页:", tab.id);
                
                // 首先注入content script
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['scripts/content.js']
                    });
                    console.log("Content script 注入成功");
                } catch (error) {
                    console.error("注入content script时出错:", error);
                    alert("注入content script时出错: " + error.message);
                    return;
                }
                
                // 发送消息到content script
                try {
                    const response = await new Promise((resolve, reject) => {
                        chrome.tabs.sendMessage(tab.id, { msg: "do-scraping" }, function(response) {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    
                    console.log("消息发送成功，响应:", response);
                } catch (error) {
                    console.error("发送消息时出错:", error);
                    alert("发送消息时出错: " + error.message);
                    return;
                }
                
                // 延迟关闭窗口，确保消息发送完成
                setTimeout(() => window.close(), 1000);
            } catch (error) {
                console.error("处理点击事件时出错:", error);
                alert("处理点击事件时出错: " + error.message);
            }
        });
        
        console.log("事件监听器设置完成");
    } catch (error) {
        console.error("初始化时出错:", error);
        alert("初始化时出错: " + error.message);
    }
});

