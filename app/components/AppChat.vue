<script setup lang="ts">
import type { ChatUIMessage, Job } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId } from 'ai'
import { LIGHT_MODEL, MODELS } from '~~/shared/constants'
import ToolAnalyseJobs from './ToolAnalyseJobs.vue'

const store = useGlobalStore()

const toast = useToast()

const { data: _chat } = await useFetch('/api/chat')
if (!_chat.value)
  throw createError({ statusCode: 404, statusMessage: 'Chat not found' })

const { data } = useNuxtData<Job[]>('jobs')
const jobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat<ChatUIMessage>({
  id: _chat.value.id,
  messages: _chat.value.messages.length
    ? _chat.value.messages
    : [{ id: generateId(), role: 'assistant', parts: [{ type: 'text', text: 'How can I help you?' }] }],

  transport: new DefaultChatTransport({ api: '/api/chat' }),
  onData({ type, data }) {
    if (type === 'data-notification')
      console.log({ type, data })
  },
  onError(error) {
    console.error(error)
  },
})

const open = shallowRef(false)

function handleSubmit() {
  const message: Parameters<typeof chat.sendMessage>[0] = {
    text: input.value,
  }

  if (jobs.value.length) {
    const content = JSON.stringify(jobs.value)
    const file = new File([content], generateId(), { type: 'text/plain' })
    const dt = new DataTransfer()
    dt.items.add(file)

    message.files = dt.files
    message.metadata = {
      analyse_jobs: jobs.value.map(j => ({ title: j.title, id: j.id })),
    }
  }

  chat.sendMessage(message)

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

  const job = data.value?.find(j => j.id === id)
  if (!job)
    return

  if (jobs.value.find(j => j.id === id))
    return

  jobs.value.push(job)
}

function removeJob(job: Job) {
  jobs.value = jobs.value.filter(j => j.id !== job.id)
}

async function deleteChat() {
  await $fetch('/api/chat', {
    method: 'DELETE',
  })
  chat.messages = []
  open.value = false
  toast.add({
    title: 'Chat deleted',
    description: 'The chat has been permanently removed.',
  })
}
</script>

<template>
  <Panel>
    <PanelHeader class="gap-2">
      <UIcon name="i-lucide-bot" class="size-5" />
      <p class="font-semibold text-highlighted truncate">
        AI Assistant
      </p>
      <div class="ml-auto">
        <UModal
          v-model:open="open"
          title="Delete chat?"
          description="This action is permanent and cannot be undone."
        >
          <UButton
            variant="soft"
            icon="i-lucide-trash"
            color="error"
            size="sm"
            :disabled="!chat.messages.length"
          />

          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="open = false"
              >
                Cancel
              </UButton>

              <UButton
                color="error"
                @click="deleteChat"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UModal>
      </div>
    </PanelHeader>

    <PanelBody>
      <div
        class="relative h-full"
        @dragover.prevent
        @drop="drop"
      >
        <div
          class="grid gap-4 relative"
          :class="{ blur: store.dragging }"
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
                        <span class="line-clamp-1">{{ job.title }}</span>
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
          :class="store.dragging ? 'z-10 opacity-100 border-inverted' : '-z-10 opacity-0 border-transparent'"
        >
          <UIcon name="i-lucide-arrow-down-to-line" class="size-6" />
          Drop here
        </div>
      </div>
    </PanelBody>

    <div class="p-4">
      <UChatPrompt
        v-model="input"
        :error="chat.error"
        :status="chat.status"
        variant="subtle"
        class="px-2"
        :ui="{ body: 'my-1.5' }"
        :autoresize="!!store.layout[1]"
        @submit.prevent="handleSubmit"
      >
        <template #header>
          <ul
            v-if="jobs.length"
            class="grid gap-2"
          >
            <li
              v-for="job in jobs"
              :key="job.id"
              class="group border border-muted px-2 py-1 rounded-md w-fit flex items-center gap-2"
            >
              <span class="line-clamp-1">{{ job.title }}</span>

              <button class="flex-center" @click="removeJob(job)">
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

          <div class="flex items-center gap-2">
            <USelect
              :default-value="LIGHT_MODEL"
              :items="MODELS"
              label-key="name"
              value-key="key"
              variant="ghost"
              class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
              :ui="{ content: 'min-w-fit' }"
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
  </Panel>
</template>
