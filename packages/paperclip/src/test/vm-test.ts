import { runPCFile } from "../vm";
import { expect } from "chai";
import { loadModuleDependencyGraph } from "../loader";
import { NodeType, Element, ParentNode, BaseNode, TextNode } from "slim-dom";

describe(__filename + "#", () => {
  [
    [
      {
        entry: `
          <component id="root">
            <template>
              Hello
            </template>
            <preview name="main">
              <root />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> Hello </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              a
            </template>
            <preview name="main">
              <root>b</root>
            </preview>
          </component>
        `
      },
      ` <root><#shadow> a </#shadow>b</root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              [[bind a]]
            </template>
            <preview name="main">
              <root a="b" />
            </preview>
          </component>
        `
      },
      ` <root a="b"><#shadow> b </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="a">
            <template>
              [[bind a]]
            </template>
          </component>
          <component id="root">
            <template>
              <a a=[[bind a]] />
              [[bind a]]
            </template>
            <preview name="main">
              <root a="b" />
            </preview>
          </component>
        `
      },
      ` <root a="b"><#shadow> <a a="b"><#shadow> b </#shadow></a> b </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              [[bind a]]
            </template>
            <preview name="main">
              <root a="[[bind 'b']]" />
            </preview>
          </component>
        `
      },
      ` <root a="b"><#shadow> b </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              [[bind a]]
            </template>
            <preview name="main">
              <root a />
            </preview>
          </component>
        `
      },
      ` <root a="true"><#shadow> true </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[repeat items as item]]>
                [[bind item]]
              </div>
            </template>
            <preview name="main">
              <root items=[[bind [1, 2, 3]]] />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> <div> 1 </div><div> 2 </div><div> 3 </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[repeat items as item, k]]>
                [[bind item]] [[bind k]]
              </div>
            </template>
            <preview name="main">
              <root items=[[bind {a: 1, b: 2}]] />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> <div> 1 a </div><div> 2 b </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[repeat items as a]]>
                <div [[repeat a as b]]>
                  [[bind b]]
                </div>
              </div>
            </template>
            <preview name="main">
              <root items=[[bind [[1, 2, 3], [4, 5, 6, 7]]]] />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> <div> <div> 1 </div><div> 2 </div><div> 3 </div> </div><div> <div> 4 </div><div> 5 </div><div> 6 </div><div> 7 </div> </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a]]>
                [[bind a]]!
              </div>
            </template>
            <preview name="main">
              <root a />
            </preview>
          </component>
        `
      },
      ` <root a="true"><#shadow> <div> true! </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a]]>
                [[bind a]]!
              </div>
            </template>
            <preview name="main">
              <root />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a]]>
                [[bind a]]!
              </div>
              <div [[else]]>
                no pass
              </div>
            </template>
            <preview name="main">
              <root />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> <div> no pass </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a === 1]]>
                One
              </div>
              <div [[elseif a === 2]]>
                Two
              </div>
            </template>
            <preview name="main">
              <root a=[[bind 1]] />
            </preview>
          </component>
        `
      },
      ` <root a="1"><#shadow> <div> One </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a === 1]]>
                One
              </div>
              <div [[elseif a === 2]]>
                Two
              </div>
              <div [[else]]>
                No pass
              </div>
            </template>
            <preview name="main">
              <root a=[[bind 2]] />
            </preview>
          </component>
        `
      },
      ` <root a="2"><#shadow> <div> Two </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <div [[if a === 1]]>
                One
              </div>
              <div [[elseif a === 2]]>
                Two
              </div>
              <div [[else]]>
                No pass
              </div>
            </template>
            <preview name="main">
              <root a=[[bind 3]] />
            </preview>
          </component>
        `
      },
      ` <root a="3"><#shadow> <div> No pass </div> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>
              <root [[if a < 3]] a=[[bind a + 1]]>
                [[bind a]]
              </root>
            </template>
            <preview name="main">
              <root a=[[bind 1]] />
            </preview>
          </component>
        `
      },
      ` <root a="1"><#shadow> <root a="2"><#shadow> <root a="3"><#shadow> </#shadow> 2 </root> </#shadow> 1 </root> </#shadow></root> `
    ],
    [
      {
        entry: `
          <component id="root">
            <template>  
              [[bind a]] [[bind 2]]
            </template>
            <preview name="main">
              <root [[bind {a: 1}]] [[bind {b: 2}]] />
            </preview>
          </component>
        `
      },
      ` <root><#shadow> 1 2 </#shadow></root> `
    ],
    [
      {
        entry: `
          <link rel="import" href="module" />
          <component id="root">
            <template>  
              <compc [[bind props]]> 
                child
              </compc>
            </template>
            <preview name="main">
              <root props=[[bind {a: 1}]] />
            </preview>
          </component>
        `,
        "/module": `
          <component id="compc">
            <template>  
              [[bind a]]
            </template>
          </component>
        `
      },
      ` <root><#shadow> <compc><#shadow> 1 </#shadow> child </compc> </#shadow></root> `
    ]
  ].forEach(([entries, result]: any) => {
    it(`can render ${entries.entry}`, async () => {
        const output = await runPCFile({
          entry: {
            filePath: "entry",
            componentId: "root",
            previewName: "main"
          },
          graph: (await loadModuleDependencyGraph("entry", {
            readFile: (uri) => {
              return Promise.resolve(entries[uri])
            }
          })).graph
        })
        expect(stringifyNode(output.document).replace(/[\s\r\n\t]+/g, " ")).to.eql(result);
    });
  });
});

const stringifyNode = (node: BaseNode) => {
  switch(node.type) {
    case NodeType.TEXT: {
      const text = node as TextNode;
      return text.value;
    }
    case NodeType.ELEMENT: {
      const element = node as Element;
      let buffer = `<${element.tagName}`;
      for (const attribute of element.attributes) {
        if (typeof attribute.value === "object") {
          continue;
        }
        buffer += ` ${attribute.name}="${attribute.value}"`;
      }
      buffer += `>`;
      if (element.shadow) {
        buffer += `<#shadow>${stringifyNode(element.shadow)}</#shadow>`;
      }

      buffer += element.childNodes.map(stringifyNode).join("");
      buffer += `</${element.tagName}>`;
      return buffer;
    }
    case NodeType.DOCUMENT_FRAGMENT: 
    case NodeType.DOCUMENT: {
      return (node as ParentNode).childNodes.map(stringifyNode).join("");
    }
  }
};