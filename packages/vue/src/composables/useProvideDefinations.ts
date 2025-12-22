import { ref, provide, type InjectionKey, type Ref } from 'vue';
import type { Definition, FootnoteDefinition } from 'mdast';

export const definationsInjectionKey: InjectionKey<{
  definations: Ref<Record<string, Definition>>
  footnoteDefinitions: Ref<Record<string, FootnoteDefinition>>
  footnoteReferenceOrder: Ref<string[]>
}> = Symbol('provideDefinations');

export function useProvideDefinations() {
  const definations = ref<Record<string, Definition>>({});
  const footnoteDefinitions = ref<Record<string, FootnoteDefinition>>({});
  const footnoteReferenceOrder = ref<string[]>([]);

  provide(definationsInjectionKey, {
    definations,
    footnoteDefinitions,
    footnoteReferenceOrder
  });

  function setDefinations(definitions: Record<string, Definition>) {
    definations.value = definitions;
  }

  function setFootnoteDefinitions(definitions: Record<string, FootnoteDefinition>) {
    footnoteDefinitions.value = definitions;
  }

  function setFootnoteReferenceOrder(order: string[]) {
    footnoteReferenceOrder.value = order;
  }

  function clearDefinations() {
    definations.value = {};
  }

  function clearFootnoteDefinitions() {
    footnoteDefinitions.value = {};
  }

  function clearFootnoteReferenceOrder() {
    footnoteReferenceOrder.value = [];
  }

  function clearAllDefinations() {
    clearDefinations();
    clearFootnoteDefinitions();
    clearFootnoteReferenceOrder();
  }

  return {
    setDefinations,
    setFootnoteDefinitions,
    setFootnoteReferenceOrder,
    clearDefinations,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinations
  }

}