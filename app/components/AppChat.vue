<script setup lang="ts">
import type { UIMessage } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { getTextFromMessage } from '~~/shared/utils'

const input = shallowRef('')
const chat = new Chat({
  // messageMetadataSchema: MetadataSchema,
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest({ messages }) {
      const body = {
        messages,
        // jobs: [...attachedJobs.value],
      }

      input.value = ''
      // attachedJobs.value = []

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
</script>

<template>
  <UDashboardPanel
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #body>
      <UChatMessages
        :messages="chat.messages"
        :status="chat.status"
        :user="{
          icon: 'i-lucide-user',
        }"
        :assistant="{
          avatar: {
            icon: 'i-lucide-sparkles',
          },
          actions: [
            {
              label: 'Copy',
              icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy',
              onClick: (e, message) => copy(e, message as UIMessage),
            },
          ],
        }"
        class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        should-auto-scroll
        :spacing-offset="160"
        :ui="{
          indicator: 'py-0 h-auto *:size-auto *:bg-transparent [&>*:nth-child(1)]:animate-none [&>*:nth-child(2)]:animate-none [&>*:nth-child(3)]:animate-none',
        }"
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
            <template v-for="(part, index) in message.parts as UIMessage['parts']" :key="`${part.type}-${index}-${message.id}`">
              <AppChatReasoning
                v-if="part.type === 'reasoning'"
                :state="part.state"
                :text="part.text"
              />
            </template>

            <MDCCached
              :value="getTextFromMessage(message as UIMessage)"
              :cache-key="message.id"
              unwrap="p"
              :parser-options="{ highlight: false }"
            />

            <template
              v-for="(part, index) in message.parts as UIMessage['parts']"
              :key="`${part.type}-${index}-${message.id}`"
            >
              // TODO
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
      <div class="p-4 sm:pm-6">
        <UChatPrompt
          v-model="input"
          :error="chat.error"
          :status="chat.status"
          variant="subtle"
          class="px-2 bg-white dark:bg-neutral-900"
          @submit="handleSubmit"
        >
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
                :items="[
                  {
                    label: 'GPT-4.1 Mini',
                    company: 'OpenAI',
                    value: 'openai/gpt-4.1-mini',
                  },
                ]"
                variant="ghost"
                size="sm"
                class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
                :ui="{
                  content: 'min-w-fit',
                  trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
              >
                <template #item-trailing="{ item }">
                  <span class="text-sm text-muted">{{ item.company }}</span>
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
