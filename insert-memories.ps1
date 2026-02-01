$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.k5m8wg-JuQN3_Seql_jF-bHgLgP2KhPehcNkAm09rUc"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.k5m8wg-JuQN3_Seql_jF-bHgLgP2KhPehcNkAm09rUc"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

$body = @(
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="Linux终端模拟器";description="让AI扮演Linux终端，输入命令获得真实输出";platform="chatgpt";category="programming";price=0;preview_content="输入命令获得终端输出";tags=@("Linux","Terminal");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="英语翻译润色专家";description="将表达变成优雅地道的英语";platform="chatgpt";category="learning";price=0.02;preview_content="检测语言翻译润色";tags=@("英语","翻译");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="模拟面试官";description="AI模拟真实面试";platform="chatgpt";category="business";price=0.03;preview_content="一对一面试模拟";tags=@("面试","求职");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="私人旅行顾问";description="推荐附近景点";platform="chatgpt";category="lifestyle";price=0;preview_content="本地人视角旅行";tags=@("旅行","攻略");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="故事大师";description="创作引人入胜故事";platform="chatgpt";category="writing";price=0;preview_content="童话教育故事";tags=@("故事","写作");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="动力教练";description="正能量策略建议";platform="chatgpt";category="lifestyle";price=0.02;preview_content="目标达成策略";tags=@("激励","目标");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="人生导师";description="帮你做更好决策";platform="chatgpt";category="lifestyle";price=0.03;preview_content="个性化人生建议";tags=@("人生","决策");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="私人健身教练";description="个性化训练计划";platform="chatgpt";category="lifestyle";price=0.02;preview_content="科学健身方案";tags=@("健身","减肥");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="营养美食顾问";description="推荐营养美味食谱";platform="chatgpt";category="lifestyle";price=0;preview_content="健康饮食建议";tags=@("美食","健康");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="财务规划师";description="预算投资风险管理";platform="chatgpt";category="business";price=0.04;preview_content="专业财务建议";tags=@("财务","投资");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="提示词生成器";description="生成完美系统提示词";platform="chatgpt";category="programming";price=0.01;preview_content="AI调教必备工具";tags=@("Prompt","AI");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="心理咨询师";description="科学心理建议";platform="chatgpt";category="lifestyle";price=0.03;preview_content="情绪支持改善";tags=@("心理","情绪");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="统计学专家";description="专业统计分析";platform="chatgpt";category="research";price=0.02;preview_content="数据分析检验";tags=@("统计","数据");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="文字冒险游戏";description="经典文字RPG体验";platform="chatgpt";category="other";price=0;preview_content="沉浸式互动故事";tags=@("游戏","RPG");status="approved"},
    @{seller_id="029acc16-b3d9-4d2a-95b1-8f9bbbff181e";title="SQL终端模拟器";description="模拟SQL数据库终端";platform="chatgpt";category="programming";price=0.01;preview_content="学习SQL完美工具";tags=@("SQL","数据库");status="approved"}
) | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://uupwzvbrcmiwkutgeqza.supabase.co/rest/v1/memories" -Method Post -Headers $headers -Body $body
Write-Host "Done! 15 memories inserted."
