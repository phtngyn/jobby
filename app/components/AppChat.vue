<script setup lang="ts">
import type { ChatUIMessage, Job } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { LIGHT_MODEL, MODELS } from '~~/shared/constants'

const { data } = useNuxtData<Job[]>('jobs')
const jobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat<ChatUIMessage>({
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
  onData({ type, data }) {
    console.log({ type, data })
  },
  onError(error) {
    console.error(error)
  },

  messages: [],
})

watch(() => chat.messages, (v) => {
  console.log(JSON.parse(JSON.stringify(v)))
}, { deep: true })

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
      root: 'max-w-1/2',
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
      <div class="grid gap-4">
        <template
          v-for="message in chat.messages"
          :key="message.id"
        >
          <template v-if="message.role === 'user'">
            <template
              v-for="part in message.parts"
              :key="`${message.id}-${message.role}-${part.type}`"
            >
              <template v-if="part.type === 'step-start'" />
              <template v-if="part.type === 'text'">
                <div class="group grid gap-2">
                  <div class="text-pretty min-w-0 bg-elevated/50 px-3 py-1.5 rounded-md w-fit ms-auto ring ring-default">
                    {{ part.text }}
                  </div>

                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center w-fit ms-auto">
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
                      :parser-options="{ highlight: false }"
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

                    <div class="flex items-center gap-3 text-xs">
                      <span
                        v-if="message.metadata?.model"
                        class="font-medium"
                      >
                        {{ message.metadata?.model }}
                      </span>

                      <span
                        v-if="message.metadata?.duration"
                        class="flex items-center gap-1"
                      >
                        <UIcon name="i-lucide-zap" class="size-3" />
                        {{ message.metadata?.duration }}s
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <DataClassification
                v-if="part.type === 'data-classification'"
                :data="part.data"
              />

              <ToolGetJob
                v-if="part.type === 'tool-get_jobs'"
                :state="part.state"
                :input="part.input"
                :output="part.output"
                :error-text="part.errorText"
                @regenerate="chat.regenerate({ messageId: message.id })"
              />
            </template>
          </template>
        </template>

        <MDC
          class="mt-8"
          :value="`<details><summary>Debug Messages</summary>\n\n\`\`\`json\n${JSON.stringify(chat.messages, null, 2)}\n\`\`\`</details>`"
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
                class="group border border-muted px-2 py-1 rounded-md w-fit flex items-center gap-2"
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
              <!-- <UButton
                icon="i-lucide-paperclip"
                color="neutral"
                size="sm"
                variant="ghost"
                disabled
              /> -->
            </div>

            <div class="flex items-center gap-1">
              <USelect
                :default-value="LIGHT_MODEL"
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
