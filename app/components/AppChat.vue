<script setup lang="ts">
import type { AppUIMessage, Job, Metadata } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { MODELS } from '~~/shared/constants'
import { MetadataSchema } from '~~/shared/schemas'

const { data } = useNuxtData<Job[]>('jobs')
const jobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat<AppUIMessage>({
  messages: [{ parts: [{ type: 'text', text: 'Generate some heading, link, and table with markdown format. Dont wrap in codeblock\n\n' }], id: 'TeFu2yIVEDqz4yT9', role: 'user' }, { id: 'H35F1VgmvMH9eO4r', metadata: { model: 'gemini-2.0-flash', totalTokens: 119, inputTokens: 18, outputTokens: 101, duration: 1.278, finishReason: 'stop' }, role: 'assistant', parts: [{ type: 'step-start' }, { type: 'text', text: '## Heading 1\n\n### Heading 3\n\n[Example Link](https://www.example.com)\n\n[Another Link with Title](https://www.example.com "Example Title")\n\n| Header 1 | Header 2 | Header 3 |\n|---|---|---|\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n| Cell 7 | Cell 8 | Cell 9 |\n', state: 'done' }] }],

  messageMetadataSchema: MetadataSchema,
  transport: new DefaultChatTransport({
    api: '/api/chats',
    prepareSendMessagesRequest({ messages }) {
      const body = {
        messages,
        jobs: [...jobs.value],
      }

      input.value = ''
      jobs.value = []

      return { body }
    },
  }),
  onError(error) {
    console.error(error)
  },
})

function handleSubmit(e: Event) {
  e.preventDefault()
  chat.sendMessage({ text: input.value })
  input.value = ''
}

const clipboard = useClipboard()
const copied = shallowRef(false)
function copy(text: string) {
  clipboard.copy(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function drop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')
  if (!id)
    return

  const job = data.value?.find(j => j.jobId === id)
  if (!job)
    return

  if (jobs.value.find(j => j.jobId === id))
    return

  jobs.value.push(job)
}

function remove(job: Job) {
  console.log(job)
  jobs.value = jobs.value.filter(j => j.jobId !== job.jobId)
}
</script>

<template>
  <UDashboardPanel
    id="app-chat"
    :ui="{
      root: 'max-w-1/3',
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <div class="h-(--ui-header-height) shrink-0 flex items-center border-b border-default p-4 gap-3">
        <UIcon name="i-lucide-bot" class="size-5" />
        <p class="font-semibold text-highlighted truncate">
          AI Assistant
        </p>
      </div>
    </template>

    <template #body>
      <div>
        <template
          v-for="message in chat.messages"
          :key="message.id"
        >
          <template v-if="message.role === 'assistant'">
            <template
              v-for="part in message.parts"
              :key="`${message.id}-${message.role}-${part.type}`"
            >
              <template v-if="part.type === 'step-start'" />
              <template v-if="part.type === 'text'">
                <div class="group grid gap-2">
                  <div class="text-pretty min-w-0 rounded-md">
                    <MDCCached
                      :value="part.text"
                      :cache-key="`${message.id}-${message.role}-${part.type}`"
                      unwrap="p"
                    />
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                    <div class="flex item-center gap-2">
                      <UButton
                        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="copy(part.text)"
                      />

                      <UButton
                        icon="i-lucide-refresh-ccw"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="chat.regenerate({ messageId: message.id })"
                      />
                    </div>

                    <div class="flex items-center gap-3">
                      <span
                        v-if="(message.metadata as Metadata)?.model"
                        class="text-sm font-medium"
                      >
                        {{ (message.metadata as Metadata)?.model }}
                      </span>

                      <span
                        v-if="(message.metadata as Metadata)?.duration"
                        class="flex items-center gap-1 text-sm"
                      >
                        <UIcon name="i-lucide-zap" class="size-3" />
                        {{ (message.metadata as Metadata)?.duration }}s
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>

          <template v-if="message.role === 'user'">
            <template
              v-for="part in message.parts"
              :key="`${message.id}-${message.role}-${part.type}`"
            >
              <template v-if="part.type === 'step-start'" />
              <template v-if="part.type === 'text'">
                <div class="group grid gap-2">
                  <div class="text-pretty min-w-0 bg-elevated/50 px-3 py-1.5 rounded-md w-fit ms-auto">
                    {{ part.text }}
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity  flex items-center w-fit ms-auto">
                    <div class="flex item-center gap-2">
                      <UButton
                        icon="i-lucide-refresh-ccw"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="chat.regenerate({ messageId: message.id })"
                      />

                      <UButton
                        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                        square
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        @click="copy(part.text)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>
        </template>

        <MDC
          class="mt-8"
          :value="`
<details>
  <summary>Debug Messages</summary>

  \`\`\`json
  ${JSON.stringify(chat.messages, null, 2)}
  \`\`\`
</details>`"
        />
      </div>
    </template>

    <template #footer>
      <div
        class="p-4"
        @dragover.prevent
        @drop="drop"
      >
        <UChatPrompt
          v-model="input"
          :error="chat.error"
          :status="chat.status"
          variant="subtle"
          class="px-2 bg-white dark:bg-neutral-900"
          :ui="{ body: 'my-1.5' }"
          @submit="handleSubmit"
        >
          <template #header>
            <ul
              v-if="jobs.length"
              class="grid gap-2"
            >
              <li
                v-for="job in jobs"
                :key="job.jobId"
                class="group border border-muted px-2 py-1 rounded-md text-sm w-fit flex items-center gap-2"
              >
                <span>{{ job.angebotstitel }}</span>

                <button class="flex-center" @click="remove(job)">
                  <UIcon name="i-lucide-x" class="size-3.5 text-muted group-hover:text-error transition-colors" />
                </button>
              </li>
            </ul>
          </template>
          <template #footer>
            <div class="flex gap-1">
              <UButton
                icon="i-lucide-paperclip"
                color="neutral"
                size="sm"
                variant="ghost"
                disabled
              />
              <UButton
                icon="i-lucide-globe"
                color="neutral"
                size="sm"
                variant="ghost"
                disabled
              />
            </div>

            <div class="flex items-center gap-1">
              <USelect
                default-value="gemini-2.0-flash"
                :items="MODELS"
                label-key="name"
                value-key="key"
                variant="ghost"
                size="sm"
                class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
                :ui="{
                  content: 'min-w-fit',
                  trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
              >
                <template #item-trailing="{ item }">
                  <span class="text-xs text-muted">{{ item.company }}</span>
                </template>
              </USelect>

              <UChatPromptSubmit
                :status="chat.status"
                size="sm"
                :label="chat.status === 'streaming' || chat.status === 'submitted' ? 'Stop' : undefined"
                @stop="chat.stop"
                @reload="chat.regenerate"
              />
            </div>
          </template>
        </UChatPrompt>
      </div>
    </template>
  </UDashboardPanel>
</template>
