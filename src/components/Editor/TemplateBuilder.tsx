import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TemplateSection, { type TemplateSectionData } from './TemplateSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { useToast } from "@/components/ui/use-toast"
// import { marked } from 'marked'
import { useToast } from '@/hooks/use-toast'

interface TemplateBuilderProps {
    content: string
    onUpdate: (content: string) => void
    onDelete: () => void
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ content, onUpdate,onDelete }) => {
    const [sections, setSections] = useState<TemplateSectionData[]>([])
    const [_mode, setMode] = useState<'edit' | 'view'>('edit')
    const [jsonInput, setJsonInput] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        // const savedTemplate = localStorage.getItem('medicalRecordTemplate')
        const savedTemplate = content
        if (savedTemplate) {
            loadTemplate(savedTemplate)
            //   try {
            //     loadTemplate(savedTemplate)
            //     setSections(JSON.parse(savedTemplate))
            //   } catch (error) {
            //     console.error('Failed to parse saved template:', error)
            //   }
        }else{
            setSections([])
        }
    }, [content])

    const addSection = () => {
        setSections([...sections, {
            title: `Section ${sections.length + 1}`,
            isMandatory: false,
            content: '',
            inclusions: [],
            exclusions: [],
            examples: [],
            isCollapsed: false
        }])
    }

    const updateSection = (index: number, sectionData: TemplateSectionData) => {
        const updatedSections = [...sections]
        updatedSections[index] = sectionData
        setSections(updatedSections)
    }

    const deleteSection = (index: number) => {
        const updatedSections = sections.filter((_, i) => i !== index)
        setSections(updatedSections)
    }

    const toggleSectionCollapse = (index: number) => {
        const updatedSections = [...sections]
        updatedSections[index].isCollapsed = !updatedSections[index].isCollapsed
        setSections(updatedSections)
    }


    const generateTemplate = () => {
        return sections.map((section, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                    {section.title}: {section.isMandatory ? 'mandatory' : 'optional'}
                </h2>
                {section.content && <p className="mb-2">{section.content}</p>}
                {section.inclusions.length > 0 && (
                    <div className="mb-2">
                        <strong>Inclusions:</strong> {section.inclusions.join(', ')}
                    </div>
                )}
                {section.exclusions.length > 0 && (
                    <div className="mb-2">
                        <strong>Exclusions:</strong> {section.exclusions.join(', ')}
                    </div>
                )}
                {section.examples.length > 0 && (
                    <div className="mb-2">
                        <strong>Examples:</strong> {section.examples.join(', ')}
                    </div>
                )}
                <hr className="my-4" />
            </div>
        ))
    }


    const saveTemplate = () => {
        const templateString = JSON.stringify(sections)
        console.info("will store template", templateString)
        onUpdate(templateString)
        // localStorage.setItem('medicalRecordTemplate', templateString)
        toast({
            title: "Template Saved",
            description: "Your template has been saved successfully.",
        })
        return templateString
    }

    const loadTemplate = (jsonString: string) => {
        setSections([])

        try {
            const parsedTemplate = JSON.parse(jsonString)
            if (Array.isArray(parsedTemplate) && parsedTemplate.every(isValidSection)) {
                setSections(parsedTemplate)
                toast({
                    title: "Template Loaded",
                    description: "Your template has been loaded successfully.",
                })
            } else {
                throw new Error('Invalid template structure')
            }
        } catch (error) {
            console.error('Failed to load template:', error)
            // toast({
            //     title: "Error",
            //     description: "Failed to load template. Please check the JSON format.",
            //     variant: "destructive",
            // })
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const isValidSection = (section: any): section is TemplateSectionData => {
        return (
            typeof section.title === 'string' &&
            typeof section.isMandatory === 'boolean' &&
            typeof section.content === 'string' &&
            Array.isArray(section.inclusions) &&
            Array.isArray(section.exclusions) &&
            Array.isArray(section.examples)
        )
    }

    return (
        <div className="container mx-auto p-4 h-fit flex flex-col">
            {/* <h1 className="text-2xl font-bold mb-4">Medical Record Template Builder</h1> */}
            <Tabs defaultValue="edit" className="flex-grow flex flex-col max-h-fit">
                <TabsList className='bg-transparent'>
                    <TabsTrigger value="edit" onClick={() => setMode('edit')}>Edit</TabsTrigger>
                    <TabsTrigger value="view" onClick={() => setMode('view')}>View</TabsTrigger>
                    {/* <TabsTrigger value="json" onClick={() => setMode('json')}>JSON</TabsTrigger> */}
                </TabsList>
                <TabsContent value="edit" className="flex-grow flex overflow-hidden">
                    <div className="flex-grow flex flex-col overflow-hidden border rounded-md mr-4 h-[80vh]">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Sections</h2>
                        </div>
                        <ScrollArea className="flex-grow p-4">
                            {sections.map((section, index) => (
                                <TemplateSection
                                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                    key={index}
                                    {...section}
                                    onUpdate={(sectionData) => updateSection(index, sectionData)}
                                    onDelete={() => deleteSection(index)}
                                    onToggleCollapse={() => toggleSectionCollapse(index)}
                                />
                            ))}
                        </ScrollArea>
                        <div className="p-4 border-t">
                            <Button onClick={addSection} className="w-full">
                                Add Section
                            </Button>
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col overflow-hidden border rounded-md h-[80vh]">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Generated Template</h2>
                        </div>
                        <ScrollArea className="flex-grow p-4">
                            <pre className="whitespace-pre-wrap">{generateTemplate()}</pre>
                        </ScrollArea>
                    </div>
                </TabsContent>
                {/* <TabsContent value="view" className="flex-grow overflow-hidden border rounded-md">
          <ScrollArea className="h-full p-4">
            <div className="prose prose-sm max-w-none !text-red" dangerouslySetInnerHTML={{ __html: marked.parse(generateTemplate()) as any }} />
          </ScrollArea>
        </TabsContent> */}
                <TabsContent value="view" className="flex-grow overflow-hidden border rounded-md h-[80vh]">
                    <ScrollArea className="h-full p-4">
                        {generateTemplate()}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="json" className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow flex flex-col border rounded-md">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Load Template from JSON</h2>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <Textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste your JSON template here..."
                                className="mb-2 flex-grow"
                            />
                            <Button onClick={() => loadTemplate(jsonInput)} className="mt-2">
                                Load Template
                            </Button>
                        </div>
                        <div className="p-4 border-t">
                            <h2 className="text-xl font-semibold mb-2">Current Template as JSON</h2>
                            <ScrollArea className="h-60 border rounded-md p-4">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(sections, null, 2)}</pre>
                            </ScrollArea>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            <div className="mt-4 flex justify-between space-x-2">
                <Button 
                variant={"ghost"}
                className='hover:bg-destructive'
                onClick={() => {
                    onDelete()
                    // navigator.clipboard.writeText(jsonString)
                    // toast({
                    //     title: "Template Copied",
                    //     description: "The template JSON has been copied to your clipboard.",
                    // })
                }}>
                    Delete Template
                </Button>
                <Button onClick={() => {
                    saveTemplate()
                    // navigator.clipboard.writeText(jsonString)
                    // toast({
                    //     title: "Template Copied",
                    //     description: "The template JSON has been copied to your clipboard.",
                    // })
                }}>
                    Save Template
                </Button>
            </div>
        </div>
    )
}

export default TemplateBuilder

