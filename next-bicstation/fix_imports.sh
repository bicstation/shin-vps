#!/bin/bash
# Replace imports in ConciergeRecommendationFlow and chat components

# 対象ディレクトリ
TARGET_DIR="./app/concierge"

# Recommendation Flow
find $TARGET_DIR/orchestration/recommendation -type f -name "*.tsx" | while read file; do
    # RecommendationList
    sed -i "s|@/app/concierge/components/RecommendationList|../sections/recommendation/RecommendationList|g" "$file"
    # ConciergeEmpty
    sed -i "s|@/app/concierge/components/ConciergeEmpty|../sections/system/ConciergeEmpty|g" "$file"
    # SemanticBadge
    sed -i "s|@/app/concierge/components/SemanticBadge|../components/atoms/SemanticBadge|g" "$file"
done

# Chat Components (CSS モジュール)
find $TARGET_DIR/sections/chat/components -type f -name "*.tsx" | while read file; do
    # ChatMessage CSS
    sed -i "s|./ChatMessage.module.css|./ChatMessage.module.css|g" "$file"
    # ChatMessageList CSS
    sed -i "s|./ChatMessageList.module.css|./ChatMessageList.module.css|g" "$file"
done

echo "✅ Import paths updated. Make sure CSS modules exist in the component directories."