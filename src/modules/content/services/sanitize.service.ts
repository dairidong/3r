import { Injectable } from '@nestjs/common';
import merge from 'deepmerge';
import sanitize from 'sanitize-html';

@Injectable()
export class SanitizeService {
    protected config: sanitize.IOptions = {};

    constructor() {
        this.config = {
            allowedTags: sanitize.defaults.allowedTags.concat(['img', 'code']),
            allowedAttributes: {
                ...sanitize.defaults.allowedAttributes,
                '*': ['class', 'style', 'height', 'width'],
            },
            parser: {
                lowerCaseTags: true,
            },
        };
    }

    sanitize(body: string, options?: sanitize.IOptions) {
        return sanitize(
            body,
            merge(this.config, options ?? {}, {
                arrayMerge: (_d, s, _0) => s,
            }),
        );
    }
}
