FROM node:22-alpine AS base

RUN corepack enable
RUN corepack prepare yarn@stable --activate

WORKDIR /app

# Install dependencies based on the preferred package manager

# 2. Rebuild the source code only when needed

COPY . .

# This will do the trick, use the corresponding env file for each environment.
COPY .env.local .env.production
RUN yarn install

RUN yarn build

# 3. Production image, copy all the files and run next
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing

WORKDIR /app

# Delete this folder cause it contains the `next` dependency which was output by Next.js builder.
# If we install dependencies later, yarn will try to rename cache file `***.tmp` to `***.zip`.
# But the name has been claimed already when it comes to `next` to be installed,
# which causes a failure of building image.
RUN rm -rf ./.yarn/cache

# Remove scripts.prepare and postinstall, as it's not needed 'husky install' in production

USER nextjs

EXPOSE 4000

ENV PORT 4000

CMD ["yarn", "start"]