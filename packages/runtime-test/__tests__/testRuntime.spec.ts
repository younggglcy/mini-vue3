import {
  h,
  render,
  nodeOps,
  TestNodeTypes,
  TestElement,
  TestText
  // ref,
  // reactive,
  // dumpOps,
  // resetOps,
  // NodeOpTypes,
  // nextTick,
  // serialize,
  // triggerEvent
} from '../src'

describe('test renderer', () => {
  it('should work', () => {
    const root = nodeOps.createElement('div')
    render(
      h(
        'div',
        {
          id: 'test'
        },
        'hello'
      ),
      root
    )

    expect(root.children.length).toBe(1)

    const el = root.children[0] as TestElement
    expect(el.type).toBe(TestNodeTypes.ELEMENT)
    expect(el.props.id).toBe('test')
    expect(el.children.length).toBe(1)

    const text = el.children[0] as TestText
    expect(text.type).toBe(TestNodeTypes.TEXT)
    expect(text.text).toBe('hello')
  })
})
