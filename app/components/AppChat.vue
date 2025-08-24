<script setup lang="ts">
import type { ChatUIMessage, Job } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId } from 'ai'
import { LIGHT_MODEL, MODELS } from '~~/shared/constants'
import ToolAnalyseJobs from './ToolAnalyseJobs.vue'

const store = useGlobalStore()

const { data } = useNuxtData<Job[]>('jobs')
const jobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat<ChatUIMessage>({
  transport: new DefaultChatTransport({ api: '/api/chats' }),
  onData({ type, data }) {
    if (type === 'data-classification')
      console.log({ type, data })
  },
  onError(error) {
    console.error(error)
  },

  messages: [],

})

function handleSubmit() {
  const fileList = (() => {
    if (!jobs.value)
      return

    const content = JSON.stringify(jobs.value)
    const file = new File([content], generateId(), { type: 'text/plain' })
    const dt = new DataTransfer()
    dt.items.add(file)
    return dt.files
  })()

  chat.sendMessage({
    text: input.value,
    files: fileList,
    metadata: {
      analyse_jobs: jobs.value.map(j => ({ title: j.angebotstitel, id: j.jobId })),
    },
  })

  jobs.value = []
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
      <div
        class="relative h-full"
        @dragover.prevent
        @drop="drop"
      >
        <div
          class="grid gap-4 relative"
          :class="{ blur: store.isJobDragging }"
        >
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

                <template v-else-if="part.type === 'text'">
                  <div class="group grid gap-2">
                    <div class="text-pretty min-w-0 bg-elevated/50 px-3 py-1.5 rounded-md w-fit ms-auto border border-default">
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

                <template v-else-if="part.type === 'file'">
                  <ul
                    v-if="message.metadata?.analyse_jobs"
                    class="w-fit ms-auto bg-elevated px-3 py-1.5 rounded-md grid gap-2 text-sm"
                  >
                    <li
                      v-for="job of message.metadata.analyse_jobs"
                      :key="job.id"
                    >
                      <NuxtLink
                        class="flex gap-1 items-center text-muted"
                        :to="`/jobs/${job.id}`"
                        active-class="text-primary"
                      >
                        <UIcon name="i-lucide-external-link" />
                        {{ job.title }}
                      </NuxtLink>
                    </li>
                  </ul>
                </template>
              </template>
            </template>

            <template v-if="message.role === 'assistant'">
              <template
                v-for="part in message.parts"
                :key="`${message.id}-${message.role}-${part.type}`"
              >
                <template v-if="part.type === 'step-start'" />

                <template v-else-if="part.type === 'text'">
                  <div class="group grid gap-2">
                    <div class="text-pretty min-w-0 rounded-md">
                      <MDCCached
                        :value="part.text"
                        :cache-key="`${message.id}-${message.role}-${part.type}`"
                        :parser-options="{ highlight: false }"
                        class="[&>:first-child]:mt-0"
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
                          v-if="message.metadata?.stats?.model"
                          class="font-medium"
                        >
                          {{ message.metadata?.stats?.model }}
                        </span>

                        <span
                          v-if="message.metadata?.stats?.outputTokens"
                          class="flex items-center gap-1"
                        >
                          <UIcon name="i-lucide-bolt" class="size-3" />
                          {{ message.metadata?.stats?.outputTokens }} tokens
                        </span>

                        <span
                          v-if="message.metadata?.stats?.duration"
                          class="flex items-center gap-1"
                        >
                          <UIcon name="i-lucide-zap" class="size-3" />
                          {{ message.metadata?.stats?.duration }} sec
                        </span>
                      </div>
                    </div>
                  </div>
                </template>

                <DataClassification
                  v-else-if="part.type === 'data-classification'"
                  :data="part.data"
                />

                <ToolGetJobs
                  v-else-if="part.type === 'tool-get_jobs'"
                  :state="part.state"
                  :input="part.input"
                  :output="part.output"
                  :error-text="part.errorText"
                  @regenerate="chat.regenerate({ messageId: message.id })"
                />

                <ToolAnalyseJobs
                  v-else-if="part.type === 'tool-analyze_jobs'"
                  :state="part.state"
                  :input="part.input"
                  :output="part.output"
                  :error-text="part.errorText"
                  :cache-key="`${message.id}-${message.role}-${part.type}`"
                />
              </template>
            </template>
          </template>

          <DevOnly>
            <MDC
              class="mt-8"
              :value="`<details><summary>Debug Messages</summary>\n\n\`\`\`json\n${JSON.stringify(chat.messages, null, 2)}\n\`\`\`\n</details>`"
            />
          </DevOnly>
        </div>

        <div
          class="absolute inset-0 size-full flex-center gap-2 text-lg border rounded-md transition-[opacity,border-color]"
          :class="store.isJobDragging ? 'z-10 opacity-100 border-inverted' : '-z-10 opacity-0 border-transparent'"
        >
          <UIcon name="i-lucide-arrow-down-to-line" class="size-6" />
          Drop here
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-4">
        <UChatPrompt
          v-model="input"
          :error="chat.error"
          :status="chat.status"
          variant="subtle"
          class="px-2"
          :ui="{ body: 'my-1.5' }"
          @submit.prevent="handleSubmit"
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
