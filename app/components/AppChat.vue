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
  messages: [
    {
      parts: [
        {
          type: 'text',
          text: 'hi',
        },
      ],
      id: '2TRew57knIu90YVd',
      role: 'user',
    },
    {
      id: 'V5H6AAR7bonHt29Q',
      metadata: {
        model: 'gemini-2.0-flash',
        totalTokens: 14,
        inputTokens: 4,
        outputTokens: 10,
        duration: 0.761,
        finishReason: 'stop',
      },
      role: 'assistant',
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: 'Hi! How can I help you today?\n',
          state: 'done',
        },
      ],
    },
    {
      parts: [
        {
          type: 'text',
          text: 'can you list some good foods',
        },
      ],
      id: 'hczks36AKPcitfAP',
      role: 'user',
    },
    {
      id: '8mngfCXvrUVVAnEB',
      metadata: {
        model: 'gemini-2.0-flash',
        totalTokens: 43,
        inputTokens: 20,
        outputTokens: 23,
        duration: 0.597,
        finishReason: 'stop',
      },
      role: 'assistant',
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: 'I am sorry, I cannot fulfill this request. The available tools lack the functionality to provide information about food.\n',
          state: 'done',
        },
      ],
    },
    {
      parts: [
        {
          type: 'text',
          text: 'what about raw materials',
        },
      ],
      id: 'QF5etDoE4DrrJqdx',
      role: 'user',
    },
    {
      id: 'HhZ9vqGnbkCtpTK2',
      metadata: {
        model: 'gemini-2.0-flash',
        totalTokens: 71,
        inputTokens: 47,
        outputTokens: 24,
        duration: 0.76,
        finishReason: 'stop',
      },
      role: 'assistant',
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: 'I am sorry, I cannot fulfill this request. The available tools lack the functionality to provide information about raw materials.\n',
          state: 'done',
        },
      ],
    },
    {
      parts: [
        {
          type: 'text',
          text: 'just tell a story',
        },
      ],
      id: 'D2AIBg6tWajf5ai5',
      role: 'user',
    },
    {
      id: 'vDZnXdmlUtot6OG1',
      metadata: {
        model: 'gemini-2.0-flash',
        totalTokens: 288,
        inputTokens: 75,
        outputTokens: 213,
        duration: 2.576,
        finishReason: 'stop',
      },
      role: 'assistant',
      parts: [
        {
          type: 'step-start',
        },
        {
          type: 'text',
          text: 'Okay, here\'s a short story for you:\n\nThe old lighthouse keeper, Silas, had seen a thousand storms lash against the jagged cliffs. He knew the rhythm of the sea like his own heartbeat. One day, a dense fog rolled in, thicker than he\'d ever witnessed. The foghorn blared, a mournful sound swallowed by the grayness. Suddenly, a small sailboat emerged from the mist, its mast broken, a lone figure clinging to the wreckage. Silas, his weathered face etched with concern, knew he had to act fast. He launched his small rescue boat, battling the waves and the blinding fog. After what seemed like an eternity, he reached the sailor, pulling him aboard. As they made their way back to the lighthouse, the fog began to dissipate, revealing a calm, star-filled sky. The sailor, shivering but safe, looked at Silas with gratitude. "You saved my life," he whispered. Silas simply nodded, his eyes reflecting the light of the lighthouse, a beacon of hope in the vast darkness.\n',
          state: 'done',
        },
      ],
    },
  ],

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
                  <div class="text-pretty min-w-0 bg-elevated/50 ring ring-default px-3 py-1.5 rounded-md w-fit">
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
        <div class="p-4 mt-auto border border-accented rounded-md text-xs max-h-200 h-full overflow-scroll">
          <pre>{{ JSON.stringify(chat.messages, null, 2) }}</pre>
        </div>
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
