import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TemplateSection, { type TemplateSectionData } from './TemplateSection'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { useToast } from "@/components/ui/use-toast"
// import { marked } from 'marked'
import { useToast } from '@/hooks/use-toast'
import { Modal } from '../ui/modal'
import { CreateTemplateForm } from '@/app/pages/(main)/template/components/create.template'

interface TemplateBuilderProps {
    content: string
    name: string
    description?: string
    template_id: string
    onUpdate: (content: string) => void
    onDelete: () => void
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ name, description,content, onUpdate, onDelete, template_id }) => {
    const [sections, setSections] = useState<TemplateSectionData[]>([])
    const [mode, setMode] = useState<'edit' | 'view'>('edit')
    const [jsonInput, setJsonInput] = useState('')
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
    // const [isCopyTemplateModalOpen, setIsCopyTemplateModalOpen] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        // const savedTemplate = localStorage.getItem('medicalRecordTemplate')
        const savedTemplate = content
        console.info("savedTemplate", savedTemplate)
        if (savedTemplate) {
            loadTemplate(savedTemplate)
            //   try {
            //     loadTemplate(savedTemplate)
            //     setSections(JSON.parse(savedTemplate))
            //   } catch (error) {
            //     console.error('Failed to parse saved template:', error)
            //   }
        } else {
            setSections([])
        }
    }, [content])

    const addSection = () => {
        setSections([...sections.map(i => { return { ...i, isCollapsed: true } }), {
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
                    {section.title}: {section.isMandatory ? 'obligatorisk felt' : 'valgfritt felt'}
                </h2>
                {section.content && <p className="mb-2">{section.content}</p>}
                {section.inclusions.length > 0 && (
                    <div className="mb-2">
                        <strong>Inkluderinger:</strong> {section.inclusions.join(', ')}
                    </div>
                )}
                {section.exclusions.length > 0 && (
                    <div className="mb-2">
                        <strong>Ekskluderinger:</strong> {section.exclusions.join(', ')}
                    </div>
                )}
                {section.examples.length > 0 && (
                    <div className="mb-2">
                        <strong>Eksempler:</strong> {section.examples.join(', ')}
                    </div>
                )}
                <hr className="my-4" />
            </div>
        ))
    }


    const saveTemplate = () => {
        const templateString = JSON.stringify(sections)
        onUpdate(templateString)
        // localStorage.setItem('medicalRecordTemplate', templateString)
        // toast({
        //     title: "Malen er lagret",
        //     description: "Malen din er lagret.",
        // })
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
        <div className="container mx-auto h-fit flex flex-col">
            <Modal
                isOpen={isEditNameModalOpen}
                onClose={() => setIsEditNameModalOpen(false)}
                title='Rediger malnavn'
                description='Rediger navnet og beskrivelsen av malen'
            >
                <CreateTemplateForm 
                    name={name}
                    content={JSON.stringify(sections)}
                    description={description}
                    template_id={template_id}
                    isUpdate={true}
                    cb={() => setIsEditNameModalOpen(false)}
                />
            </Modal>
            {/* <Modal
                isOpen={isCopyTemplateModalOpen}
                onClose={() => setIsCopyTemplateModalOpen(false)}
                title='Copy Template'
                description='Copy the template to your clipboard'
            >

            </Modal> */}
            {/* <h1 className="text-2xl font-bold mb-4">Medical Record Template Builder</h1> */}
            <Tabs defaultValue="edit" value={mode} className="flex-grow flex flex-col max-h-fit">
                {/* <TabsList className='bg-transparent'>
                    <TabsTrigger value="edit" onClick={() => setMode('edit')}>Edit</TabsTrigger>
                    <TabsTrigger value="view" onClick={() => setMode('view')}>View</TabsTrigger>
                    <TabsTrigger value="json" onClick={() => setMode('json')}>JSON</TabsTrigger>
                </TabsList> */}
                <TabsContent value="edit" className="flex-grow flex overflow-hidden gap-x-8">
                    <div className="flex-grow flex flex-col overflow-hidden border rounded-md h-[80vh]">
                        <div className="p-4 border-b flex justify-between">
                            <h2 className="text-xl font-semibold">Seksjoner</h2>
            
                                <div className='flex gap-x-4 justify-end'>
                                    <Button variant="outline" onClick={()=>{setIsEditNameModalOpen(true)}}>Rediger navn</Button>
                                    {/* <Button variant="outline">Lag nytt fra mal</Button> */}
 
                                </div>
          
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
                                Legg til seksjon
                            </Button>
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col overflow-hidden border rounded-md h-[80vh]">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Generert mal</h2>
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
                    <ScrollArea className="h-full">
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
                    Slett mal
                </Button>
                <div className='flex gap-x-4 items-center justify-center'>
                    <Button
                        variant={"ghost"}
                        onClick={() => {
                            setMode('edit')
                        }}>
                        Redigere
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => {
                            setMode('view')
                        }}>
                        Inspiser
                    </Button>
                </div>
                <Button onClick={() => {
                    saveTemplate()
                    // navigator.clipboard.writeText(jsonString)
                    // toast({
                    //     title: "Template Copied",
                    //     description: "The template JSON has been copied to your clipboard.",
                    // })
                }}>
                    Lagre mal
                </Button>
            </div>
        </div>
    )
}

export default TemplateBuilder

