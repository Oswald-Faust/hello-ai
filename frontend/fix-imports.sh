#!/bin/bash

# Remplacer les importations avec la bonne casse
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Card/@\/components\/ui\/card/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Button/@\/components\/ui\/button/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Input/@\/components\/ui\/input/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Label/@\/components\/ui\/label/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Alert/@\/components\/ui\/alert/g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Textarea/@\/components\/ui\/textarea/g' {} + 