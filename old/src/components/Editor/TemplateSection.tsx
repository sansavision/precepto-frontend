import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface TemplateSectionData {
  title: string
  isMandatory: boolean
  content: string
  inclusions: string[]
  exclusions: string[]
  examples: string[]
  isCollapsed: boolean
}
type FieldTranslations = 'inclusions' | 'exclusions' | 'examples'
interface TemplateSectionProps extends TemplateSectionData {
  onUpdate: (sectionData: TemplateSectionData) => void
  onDelete: () => void
  onToggleCollapse: () => void
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  title,
  isMandatory,
  content,
  inclusions,
  exclusions,
  examples,
  isCollapsed,
  onUpdate,
  onDelete,
  onToggleCollapse
}) => {
  const [sectionData, setSectionData] = useState<TemplateSectionData>({
    title,
    isMandatory,
    content,
    inclusions,
    exclusions,
    examples,
    isCollapsed
  })

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleUpdate = (field: keyof TemplateSectionData, value: any) => {
    const updatedData = { ...sectionData, [field]: value }
    setSectionData(updatedData)
    onUpdate(updatedData)
  }

  const handleListUpdate = (field: 'inclusions' | 'exclusions' | 'examples', value: string) => {
    const updatedList = [...sectionData[field], value]
    handleUpdate(field, updatedList)
  }

  const handleListRemove = (field: 'inclusions' | 'exclusions' | 'examples', index: number) => {
    const updatedList = sectionData[field].filter((_, i) => i !== index)
    handleUpdate(field, updatedList)
  }

  const translateFields = (field:FieldTranslations ) => {
    switch (field) {
      case 'inclusions':
        return 'Inkluderinger'
      case 'exclusions':
        return 'Ekskluderinger'
      case 'examples':
        return 'Eksempler'
      default:
        return ''
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="mr-2">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Input
              value={sectionData.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="font-bold text-lg"
            />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id={`mandatory-${title}`}
              checked={sectionData.isMandatory}
              onCheckedChange={(checked) => handleUpdate('isMandatory', checked)}
            />
            <Label htmlFor={`mandatory-${title}`}>Mandatory</Label>
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <Textarea
            value={sectionData.content}
            onChange={(e) => handleUpdate('content', e.target.value)}
            placeholder="Enter section content..."
            className="mb-2"
          />
          {['inclusions', 'exclusions', 'examples'].map((field) => (
            <div key={field} className="mb-2">
              <h4 className="font-semibold capitalize mb-2">{translateFields(field as FieldTranslations)}</h4>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder={`Legge til  ${translateFields(field as FieldTranslations) }... (trykk på Enter for å legge til)`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleListUpdate(field as 'inclusions' | 'exclusions' | 'examples', e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <ul className="list-disc list-inside gap-y-6 flex flex-col">
                {sectionData[field as 'inclusions' | 'exclusions' | 'examples'].map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<li key={index} className="flex justify-between items-center text-xs font-semibold text-white/80 my-4">
                    {item}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleListRemove(field as 'inclusions' | 'exclusions' | 'examples', index)}
                    >
                      Fjerne
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Button variant="destructive" onClick={onDelete}>
          Slett seksjon
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export default TemplateSection

