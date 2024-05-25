import 'reactflow/dist/style.css';
import { changeSidebarTab, changeTitle, onClearSuggestedItems, userChoiceToItemType } from '../utils/utility';
import useFetchSuggestedItems from './useFetchSuggestedItems';
import { ItemType, UserChoice } from '../interfaces/interfaces';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedClassesState, suggestedAssociationsState, textFilteringVariationState, textFilteringVariationSnapshotsState } from '../atoms';
import { snapshotDomainDescription, snapshotTextFilteringVariation } from '../utils/snapshot';


const useSuggestItems = () =>
{
  const setSuggestedClasses = useSetRecoilState(suggestedClassesState)
  const setSuggestedAttributes = useSetRecoilState(suggestedAttributesState)
  const setSuggestedAssociations = useSetRecoilState(suggestedAssociationsState)

  const setSidebarTitles = useSetRecoilState(sidebarTitlesState)
  const setSidebarTab = useSetRecoilState(sidebarTabValueState)

  const domainDescription = useRecoilValue(domainDescriptionState)
  const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
  const textFilteringVariation = useRecoilValue(textFilteringVariationState)

  const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
  const setTextFilteringVariationSnapshot = useSetRecoilState(textFilteringVariationSnapshotsState)

  const { fetchSuggestedItems } = useFetchSuggestedItems()


  const onSuggestItems = (userChoice: UserChoice, sourceItemName: string | null, targetItemName: string | null): void =>
  {
    const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription

    sourceItemName = sourceItemName !== null ? sourceItemName : ""
    targetItemName = targetItemName !== null ? targetItemName : ""

    const itemType: ItemType = userChoiceToItemType(userChoice)

    onClearSuggestedItems(itemType, setSuggestedClasses, setSuggestedAttributes, setSuggestedAssociations)
    changeSidebarTab(itemType, setSidebarTab)
    changeTitle(userChoice, sourceItemName, targetItemName, setSidebarTitles)

    // Snapshot current configuration to know from what parameters the suggestions were generated
    snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)
    snapshotTextFilteringVariation(userChoice, textFilteringVariation, setTextFilteringVariationSnapshot)

    const bodyData = JSON.stringify({
      "sourceClass": sourceItemName, "targetClass": targetItemName, "userChoice": userChoice, "domainDescription": currentDomainDescription,
      "filteringVariation": textFilteringVariation
    })

    fetchSuggestedItems(bodyData, sourceItemName, itemType)
  }

  return { onSuggestItems }
}

export default useSuggestItems