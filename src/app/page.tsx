'use client'

import { LiveImageShape, LiveImageShapeUtil } from '@/components/LiveImageShapeUtil'
import * as fal from '@fal-ai/serverless-client'
import { Editor, Tldraw, useEditor } from '@tldraw/tldraw'
import { useEffect } from 'react'
import { LiveImageTool, MakeLiveButton } from '../components/LiveImageTool'

fal.config({
	requestMiddleware: fal.withProxy({
		targetUrl: '/api/fal/proxy',
	}),
})

const shapeUtils = [LiveImageShapeUtil]
const tools = [LiveImageTool]

export default function Home() {
	const onEditorMount = (editor: Editor) => {
		// We need the editor to think that the live image shape is a frame
		// @ts-expect-error: patch
		editor.isShapeOfType = function (arg, type) {
			const shape = typeof arg === 'string' ? this.getShape(arg)! : arg
			if (shape.type === 'live-image' && type === 'frame') {
				return true
			}
			return shape.type === type
		}

		// If there isn't a live image shape, create one
		if (!editor.getCurrentPageShapes().some((shape) => shape.type === 'live-image')) {
			editor.createShape<LiveImageShape>({
				type: 'live-image',
				x: 120,
				y: 180,
				props: {
					w: 512,
					h: 512,
					name: 'a city skyline',
				},
			})
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="fixed inset-0">
				<Tldraw
					persistenceKey="tldraw-fal"
					onMount={onEditorMount}
					shapeUtils={shapeUtils}
					tools={tools}
					shareZone={<MakeLiveButton />}
				>
					<SneakySideEffects />
				</Tldraw>
			</div>
		</main>
	)
}

function SneakySideEffects() {
	const editor = useEditor()

	useEffect(() => {
		editor.sideEffects.registerAfterChangeHandler('shape', () => {
			editor.emit('update-drawings' as any)
		})
	}, [editor])

	return null
}
