<script setup lang="ts">
import type { UIMessage } from 'ai'
import type { Job } from '~~/shared/types'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { MODELS } from '~~/shared/constants'
import { MetadataSchema } from '~~/shared/schemas'
import { getTextFromMessage } from '~~/shared/utils'

const { data: jobs } = useNuxtData<Job[]>('jobs')
const attachedJobs = ref<Job[]>([])

const input = shallowRef('')
const chat = new Chat({
  messageMetadataSchema: MetadataSchema,
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest({ messages }) {
      const body = {
        messages,
        jobs: [...attachedJobs.value],
      }

      input.value = ''
      attachedJobs.value = []

      return { body }
    },
  }),
})

function handleSubmit(e: Event) {
  e.preventDefault()
  chat.sendMessage({ text: input.value })
  input.value = ''
}

const clipboard = useClipboard()
const copied = shallowRef(false)
function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function drop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')
  if (!id)
    return

  const job = jobs.value?.find(j => j.id === id)
  if (!job)
    return

  if (attachedJobs.value.find(j => j.id === id))
    return

  attachedJobs.value.push(job)
}

function remove(job: Job) {
  console.log(job)
  attachedJobs.value = attachedJobs.value.filter(j => j.id !== job.id)
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
      <UChatMessages
        :messages="chat.messages.map(m => ({
          ...m,
          content: '',
        }))"
        :status="chat.status"
        :assistant="{
          actions: [
            {
              label: 'Copy',
              icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy',
              onClick: (e, message) => copy(e, message as UIMessage),
            },
          ],
        }"
        should-auto-scroll
        :spacing-offset="160"
      >
        <template #content="{ message }">
          <UButton
            v-if="message.parts?.length === 0 && message.role === 'assistant'"
            class="px-0 group"
            color="neutral"
            variant="link"
            loading
            loading-icon="i-lucide-loader"
          >
            <AppChatTextGradient text="Thinking..." />
          </UButton>

          <div class="space-y-4">
            <template
              v-for="(part, index) in message.parts as UIMessage['parts']"
              :key="`${part.type}-${index}-${message.id}`"
            >
              <template v-if="part.type === 'step-start'" />

              <AppChatReasoning
                v-if="part.type === 'reasoning'"
                :state="part.state"
                :text="part.text"
              />

              <ToolFindJob
                v-else-if="part.type === 'tool-find_job'"
                v-bind="part as any"
              />

              <MDCCached
                v-else-if="part.type === 'text'"
                :value="part.text"
                :cache-key="message.id"
                unwrap="p"
                :parser-options="{ highlight: false }"
              />
            </template>
          </div>
        </template>

        <template #indicator>
          <UButton
            class="px-0 group"
            color="neutral"
            variant="link"
            loading
            loading-icon="i-lucide-loader"
          >
            <AppChatTextGradient text="Thinking..." />
          </UButton>
        </template>
      </UChatMessages>
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
              v-if="attachedJobs.length"
              class="grid gap-2"
            >
              <li
                v-for="job in attachedJobs"
                :key="job.id"
                class="group border border-muted px-2 py-1 rounded-md text-sm w-fit flex items-center gap-2"
              >
                <span>{{ job.title }}</span>

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
